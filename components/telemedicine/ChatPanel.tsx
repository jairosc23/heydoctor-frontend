"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchConsultationMessages,
  postConsultationMessage,
  type ConsultationMessage,
  type ConsultationMessageAttachment,
} from "@/lib/services/consultation-messages";

interface ChatPanelProps {
  consultationId: string;
  /** Identidad de quien escribe (doctor por defecto en el panel del médico). */
  sender?: "doctor" | "patient";
  /** Polling al backend cada N ms. `0` desactiva polling. Default 5000. */
  pollIntervalMs?: number;
  /** Tamaño máximo permitido de adjunto (bytes). Default 4 MB. */
  maxAttachmentBytes?: number;
  className?: string;
}

const DEFAULT_MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const DEFAULT_POLL_MS = 5000;
const ACCEPT_TYPES = "image/*,application/pdf";

const STORAGE_PREFIX = "heydoctor:chat:";

interface PersistedChat {
  messages: ConsultationMessage[];
  /** Última sincronización con backend (ms epoch). */
  lastSync: number | null;
}

function loadFromStorage(consultationId: string): PersistedChat {
  if (typeof window === "undefined") return { messages: [], lastSync: null };
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${consultationId}`);
    if (!raw) return { messages: [], lastSync: null };
    const parsed = JSON.parse(raw) as PersistedChat;
    if (!parsed || !Array.isArray(parsed.messages)) {
      return { messages: [], lastSync: null };
    }
    return parsed;
  } catch {
    return { messages: [], lastSync: null };
  }
}

function saveToStorage(
  consultationId: string,
  data: PersistedChat,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${consultationId}`,
      JSON.stringify(data),
    );
  } catch {
    /**
     * QuotaExceeded o storage deshabilitado: no rompemos la UI; el chat sigue
     * funcionando en memoria mientras dure la sesión.
     */
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("read error"));
    reader.readAsDataURL(file);
  });
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function mergeMessages(
  local: ConsultationMessage[],
  remote: ConsultationMessage[],
): ConsultationMessage[] {
  const byId = new Map<string, ConsultationMessage>();
  for (const m of local) byId.set(m.id, m);
  for (const m of remote) {
    /**
     * Cuando llega del backend con id real, prevalece (perdemos el flag
     * `pending`). Mensajes locales que aún no se confirmaron permanecen.
     */
    byId.set(m.id, { ...byId.get(m.id), ...m, pending: false });
  }
  return Array.from(byId.values()).sort((a, b) => a.timestamp - b.timestamp);
}

function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatPanel({
  consultationId,
  sender = "doctor",
  pollIntervalMs = DEFAULT_POLL_MS,
  maxAttachmentBytes = DEFAULT_MAX_ATTACHMENT_BYTES,
  className = "",
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [bodyInput, setBodyInput] = useState("");
  const [pendingAttachment, setPendingAttachment] =
    useState<ConsultationMessageAttachment | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /** Hidrata estado inicial desde localStorage en mount. */
  useEffect(() => {
    const persisted = loadFromStorage(consultationId);
    setMessages(persisted.messages);
  }, [consultationId]);

  /** Persiste cada cambio. */
  useEffect(() => {
    saveToStorage(consultationId, { messages, lastSync: Date.now() });
  }, [consultationId, messages]);

  /** Auto-scroll al final cuando llegan mensajes nuevos. */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const refreshFromBackend = useCallback(async () => {
    try {
      const remote = await fetchConsultationMessages(consultationId);
      setBackendOnline(true);
      if (remote.length === 0) return;
      setMessages((prev) => mergeMessages(prev, remote));
      if (process.env.NODE_ENV === "development") {
        console.debug("[heydoctor][chat] sync", {
          consultationId,
          remoteCount: remote.length,
        });
      }
    } catch (e) {
      setBackendOnline(false);
      if (process.env.NODE_ENV === "development") {
        console.error("[heydoctor][chat] sync falló", e);
      }
    }
  }, [consultationId]);

  /** Polling al backend (degrada a no-op si el endpoint no existe). */
  useEffect(() => {
    if (pollIntervalMs <= 0) return;
    void refreshFromBackend();
    const id = window.setInterval(() => void refreshFromBackend(), pollIntervalMs);
    return () => window.clearInterval(id);
  }, [pollIntervalMs, refreshFromBackend]);

  const handleFilePicked = async (file: File | null) => {
    if (!file) return;
    setError(null);
    if (file.size > maxAttachmentBytes) {
      setError(
        `El archivo supera el máximo permitido (${Math.round(
          maxAttachmentBytes / 1024 / 1024,
        )} MB).`,
      );
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setPendingAttachment({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
      });
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[heydoctor][chat] adjuntar falló", e);
      }
      setError("No se pudo leer el archivo. Intenta otro.");
    }
  };

  const handleSend = async () => {
    const body = bodyInput.trim();
    if (!body && !pendingAttachment) return;
    const optimistic: ConsultationMessage = {
      id: genId(),
      consultationId,
      body,
      sender,
      timestamp: Date.now(),
      attachment: pendingAttachment ?? null,
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setBodyInput("");
    const attachmentToSend = pendingAttachment;
    setPendingAttachment(null);
    setSending(true);
    setError(null);

    try {
      const created = await postConsultationMessage(consultationId, {
        body,
        attachment: attachmentToSend,
        sender,
      });
      if (created) {
        setBackendOnline(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id
              ? { ...optimistic, ...created, pending: false }
              : m,
          ),
        );
      } else {
        /**
         * Backend respondió 404 (endpoint no implementado). Dejamos el mensaje
         * en estado "local-only" para que al menos quede registro en el
         * dispositivo del médico.
         */
        setBackendOnline(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id ? { ...m, pending: false } : m,
          ),
        );
      }
    } catch (e) {
      setBackendOnline(false);
      if (process.env.NODE_ENV === "development") {
        console.error("[heydoctor][chat] enviar falló", e);
      }
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo enviar el mensaje. Quedó guardado localmente.",
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const banner = useMemo(() => {
    if (backendOnline === false) {
      return "Sin conexión con el backend de mensajes. Tus mensajes quedarán guardados en este dispositivo.";
    }
    return null;
  }, [backendOnline]);

  return (
    <section
      className={`flex flex-col rounded-lg border border-gray-200 bg-white ${className}`}
      style={{ minHeight: 320 }}
      aria-label="Chat de teleconsulta"
    >
      <header className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span aria-hidden>💬</span> Chat
          {backendOnline === false && (
            <span
              className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-normal"
              title="El backend de mensajes no está disponible. Modo local."
            >
              local
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => void refreshFromBackend()}
          className="text-xs text-indigo-600 hover:text-indigo-700"
          aria-label="Actualizar mensajes"
        >
          Actualizar
        </button>
      </header>

      {banner && (
        <p className="px-3 py-1.5 text-[11px] text-amber-800 bg-amber-50 border-b border-amber-200">
          {banner}
        </p>
      )}

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2"
        style={{ maxHeight: 320 }}
      >
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            Aún no hay mensajes. Escribe el primero.
          </p>
        ) : (
          messages.map((m) => (
            <ChatMessageRow key={m.id} message={m} mine={m.sender === sender} />
          ))
        )}
      </div>

      {pendingAttachment && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
          <AttachmentPreview attachment={pendingAttachment} small />
          <span className="text-xs text-gray-600 truncate flex-1">
            {pendingAttachment.name}
          </span>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            className="text-xs text-red-600 hover:text-red-800"
            aria-label="Quitar adjunto"
          >
            Quitar
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="px-3 py-1.5 text-[11px] text-red-700 bg-red-50 border-t border-red-200"
        >
          {error}
        </p>
      )}

      <div className="flex items-end gap-2 px-3 py-2 border-t border-gray-200">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            void handleFilePicked(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Adjuntar archivo"
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
        >
          <span aria-hidden style={{ fontSize: 18 }}>
            📎
          </span>
        </button>
        <textarea
          value={bodyInput}
          onChange={(e) => setBodyInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe un mensaje…"
          rows={1}
          className="flex-1 resize-none px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || (!bodyInput.trim() && !pendingAttachment)}
          className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 disabled:opacity-50"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </section>
  );
}

function ChatMessageRow({
  message,
  mine,
}: {
  message: ConsultationMessage;
  mine: boolean;
}) {
  return (
    <div
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
      data-message-pending={message.pending ? "true" : "false"}
    >
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          mine
            ? "bg-teal-600 text-white"
            : "bg-gray-100 text-gray-800 border border-gray-200"
        }`}
      >
        {message.attachment && (
          <AttachmentPreview attachment={message.attachment} />
        )}
        {message.body && (
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        )}
        <div
          className={`flex items-center gap-1 text-[10px] mt-1 ${
            mine ? "text-teal-100" : "text-gray-500"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {message.pending && <span aria-label="Pendiente de envío">· enviando…</span>}
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({
  attachment,
  small = false,
}: {
  attachment: ConsultationMessageAttachment;
  small?: boolean;
}) {
  const isImage = attachment.mimeType.startsWith("image/");
  const isPdf =
    attachment.mimeType === "application/pdf" ||
    attachment.name.toLowerCase().endsWith(".pdf");
  const href = attachment.url ?? attachment.dataUrl ?? "#";

  if (isImage && (attachment.url || attachment.dataUrl)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={href}
          alt={attachment.name}
          style={{
            display: "block",
            maxWidth: small ? 56 : 220,
            maxHeight: small ? 56 : 220,
            borderRadius: 8,
            marginBottom: small ? 0 : 6,
            objectFit: "cover",
          }}
        />
      </a>
    );
  }
  if (isPdf) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs underline mb-1"
      >
        <span aria-hidden>📄</span>
        <span className="truncate">{attachment.name}</span>
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs underline mb-1"
    >
      <span aria-hidden>📎</span>
      <span className="truncate">{attachment.name}</span>
    </a>
  );
}
