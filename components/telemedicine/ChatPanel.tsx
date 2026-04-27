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
  inferAttachmentKind,
  postConsultationMessage,
  type AttachmentKind,
  type ConsultationMessage,
  type ConsultationMessageAttachment,
} from "@/lib/services/consultation-messages";
import { createClinicalLogger } from "@/lib/clinical-logger";

const log = createClinicalLogger("consultation");

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
/**
 * Mime types aceptados: imágenes (JPG/PNG/HEIC), PDFs y audio (notas de voz
 * desde móvil o grabaciones). El navegador puede ignorar el filtro en drag&drop,
 * por eso volvemos a validar `kind` después.
 */
const ACCEPT_TYPES =
  "image/*,application/pdf,audio/*,audio/webm,audio/mp4,audio/mpeg,audio/ogg,audio/wav,.webm,.m4a,.aac";
const EXAM_ACCEPT = "image/*,application/pdf,.pdf";

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const KIND_BADGE: Record<AttachmentKind, { label: string; color: string }> = {
  image: { label: "Imagen", color: "bg-sky-100 text-sky-800" },
  pdf: { label: "PDF", color: "bg-violet-100 text-violet-800" },
  audio: { label: "Audio", color: "bg-emerald-100 text-emerald-800" },
  lab_result: { label: "Resultado lab", color: "bg-amber-100 text-amber-900" },
  other: { label: "Archivo", color: "bg-gray-100 text-gray-700" },
};

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
  /** True cuando hay un drag activo sobre el panel (overlay visible). */
  const [dragging, setDragging] = useState(false);

  const examInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  /** Counter para drag enter/leave en hijos (evita parpadeo del overlay). */
  const dragCounterRef = useRef(0);

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
      log.debug("chat sync", {
        consultationId,
        remoteCount: remote.length,
      });
    } catch (e) {
      setBackendOnline(false);
      log.debug("chat sync failed", e);
    }
  }, [consultationId]);

  /** Polling al backend (degrada a no-op si el endpoint no existe). */
  useEffect(() => {
    if (pollIntervalMs <= 0) return;
    void refreshFromBackend();
    const id = window.setInterval(() => void refreshFromBackend(), pollIntervalMs);
    return () => window.clearInterval(id);
  }, [pollIntervalMs, refreshFromBackend]);

  const ingestFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > maxAttachmentBytes) {
        setError(
          `El archivo supera el máximo permitido (${Math.round(
            maxAttachmentBytes / 1024 / 1024,
          )} MB).`,
        );
        return;
      }
      const mime = file.type || "application/octet-stream";
      try {
        const dataUrl = await fileToDataUrl(file);
        const kind = inferAttachmentKind(mime, file.name);
        setPendingAttachment({
          name: file.name,
          mimeType: mime,
          size: file.size,
          kind,
          dataUrl,
        });
        log.debug("attachment ready", { name: file.name, mime, kind });
      } catch (e) {
        log.warn("attach failed", e);
        setError("No se pudo leer el archivo. Intenta otro.");
      }
    },
    [maxAttachmentBytes],
  );

  const handleFilePicked = (file: File | null) => {
    if (!file) return;
    void ingestFile(file);
  };

  /** Marca / desmarca el adjunto pendiente como resultado de laboratorio. */
  const togglePendingLabResult = () => {
    setPendingAttachment((current) => {
      if (!current) return current;
      const isLab = current.kind === "lab_result";
      const fallbackKind = inferAttachmentKind(current.mimeType, current.name);
      return {
        ...current,
        /**
         * Si ya estaba marcado como `lab_result`, restauramos la inferencia
         * automática (image/pdf/other). Si no, lo forzamos a `lab_result`.
         */
        kind: isLab && fallbackKind !== "lab_result" ? fallbackKind : "lab_result",
      };
    });
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
        setBackendOnline(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id ? { ...m, pending: false } : m,
          ),
        );
      }
    } catch (e) {
      setBackendOnline(false);
      log.warn("chat send failed", e);
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

  /* ────── Drag & Drop (desktop) ────── */
  const onDragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragCounterRef.current += 1;
    setDragging(true);
  };
  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = () => {
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragCounterRef.current = 0;
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    /**
     * Solo aceptamos un archivo a la vez (UX simple). Si el usuario suelta
     * varios, ignoramos los extras y avisamos.
     */
    if (files.length > 1) {
      setError("Solo se admite un archivo a la vez. Tomamos el primero.");
    }
    void ingestFile(files[0]);
  };

  const banner = useMemo(() => {
    if (backendOnline === false) {
      return "Sin conexión con el backend de mensajes. Tus mensajes quedarán guardados en este dispositivo.";
    }
    return null;
  }, [backendOnline]);

  return (
    <section
      className={`relative flex flex-col rounded-lg border border-gray-200 bg-white ${className}`}
      style={{
        minHeight: 280,
        paddingBottom: "max(4px, env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Chat de teleconsulta"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
        className="flex-1 overflow-y-auto px-2 py-2 space-y-2 sm:px-3 max-h-[min(58dvh,420px)] md:max-h-[320px]"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6 px-1">
            Escribe un mensaje, adjunta imagen, PDF o nota de voz — o arrastra un
            archivo aquí.
          </p>
        ) : (
          messages.map((m) => (
            <ChatMessageRow key={m.id} message={m} mine={m.sender === sender} />
          ))
        )}
      </div>

      {pendingAttachment && (
        <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-2 py-2 sm:flex-row sm:items-center sm:px-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {pendingAttachment.mimeType.startsWith("audio/") &&
            (pendingAttachment.dataUrl || pendingAttachment.url) ? (
              <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-[240px]">
                <audio
                  controls
                  preload="metadata"
                  src={
                    pendingAttachment.url ??
                    pendingAttachment.dataUrl ??
                    undefined
                  }
                  className="h-10 w-full"
                />
              </div>
            ) : (
              <AttachmentPreview attachment={pendingAttachment} small />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-gray-700">
                {pendingAttachment.name}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    KIND_BADGE[pendingAttachment.kind ?? "other"].color
                  }`}
                >
                  {KIND_BADGE[pendingAttachment.kind ?? "other"].label}
                </span>
                <span>{formatBytes(pendingAttachment.size)}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {pendingAttachment.mimeType.startsWith("image/") ||
            pendingAttachment.mimeType === "application/pdf" ||
            pendingAttachment.name.toLowerCase().endsWith(".pdf") ? (
              <button
                type="button"
                onClick={togglePendingLabResult}
                className={`rounded border px-2 py-1 text-[10px] transition-colors ${
                  pendingAttachment.kind === "lab_result"
                    ? "border-amber-300 bg-amber-100 text-amber-900"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-pressed={pendingAttachment.kind === "lab_result"}
              >
                {pendingAttachment.kind === "lab_result"
                  ? "✓ Resultado lab"
                  : "Marcar como lab"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setPendingAttachment(null)}
              className="min-h-11 shrink-0 px-2 text-xs text-red-600 hover:text-red-800 sm:min-h-0"
              aria-label="Quitar adjunto"
            >
              Quitar
            </button>
          </div>
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

      <div className="flex flex-wrap items-end gap-1.5 border-t border-gray-200 px-2 py-2 sm:gap-2 sm:px-3">
        <input
          ref={examInputRef}
          type="file"
          accept={EXAM_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleFilePicked(file);
            e.target.value = "";
          }}
        />
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleFilePicked(file);
            e.target.value = "";
          }}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*,.webm,.m4a,.aac,.mp3,.wav,.ogg,application/ogg"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleFilePicked(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => examInputRef.current?.click()}
          aria-label="Adjuntar examen o documento (imagen o PDF)"
          title="Examen o PDF"
          className="flex min-h-11 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 sm:gap-1.5 sm:px-2.5"
        >
          <span aria-hidden>📎</span>
          <span className="hidden min-[380px]:inline">Examen</span>
        </button>
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          aria-label="Tomar o elegir foto"
          title="Foto"
          className="flex min-h-11 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 sm:gap-1.5 sm:px-2.5"
        >
          <span aria-hidden>📷</span>
          <span className="hidden min-[380px]:inline">Foto</span>
        </button>
        <button
          type="button"
          onClick={() => audioInputRef.current?.click()}
          aria-label="Grabar o adjuntar audio"
          title="Audio"
          className="flex min-h-11 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 sm:gap-1.5 sm:px-2.5"
        >
          <span aria-hidden>🎤</span>
          <span className="hidden min-[380px]:inline">Audio</span>
        </button>
        <textarea
          value={bodyInput}
          onChange={(e) => setBodyInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe un mensaje…"
          rows={1}
          className="min-h-11 flex-1 min-w-[140px] resize-none rounded-md border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || (!bodyInput.trim() && !pendingAttachment)}
          className="min-h-11 shrink-0 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>

      {dragging && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-teal-400 bg-teal-50/90 pointer-events-none"
          aria-hidden
        >
          <div className="text-center">
            <span className="block text-2xl mb-1" aria-hidden>
              📥
            </span>
            <p className="text-sm font-semibold text-teal-800">
              Suelta para adjuntar
            </p>
            <p className="text-[11px] text-teal-700/80 mt-0.5">
              Imagen, PDF o audio (máx. {Math.round(maxAttachmentBytes / 1024 / 1024)}{" "}
              MB)
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function hasFiles(e: React.DragEvent): boolean {
  const types = Array.from(e.dataTransfer?.types ?? []);
  return types.includes("Files");
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
        className={`max-w-[min(92%,520px)] rounded-2xl px-3 py-2 text-sm shadow-sm ${
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
  const kind: AttachmentKind =
    attachment.kind ??
    inferAttachmentKind(attachment.mimeType, attachment.name);
  const href = attachment.url ?? attachment.dataUrl ?? "#";
  const badge = KIND_BADGE[kind];

  if ((kind === "image" || kind === "lab_result") &&
      attachment.mimeType.startsWith("image/") &&
      (attachment.url || attachment.dataUrl)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
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
        {!small && kind === "lab_result" && (
          <span
            className={`inline-block text-[10px] mt-1 px-1.5 py-0.5 rounded font-medium ${badge.color}`}
          >
            {badge.label}
          </span>
        )}
      </a>
    );
  }

  if (kind === "audio" && (attachment.url || attachment.dataUrl)) {
    if (small) {
      return (
        <div className="inline-flex max-w-[min(100vw-4rem,220px)] items-center align-middle">
          <audio
            controls
            preload="metadata"
            src={href}
            className="h-9 w-full min-w-[120px]"
          />
        </div>
      );
    }
    return (
      <div className="mb-1 min-w-0 max-w-[min(100%,280px)]">
        <audio
          controls
          preload="metadata"
          src={href}
          className="h-10 w-full"
        />
        <span
          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.color}`}
        >
          {badge.label}
        </span>
      </div>
    );
  }

  if (kind === "pdf" || (kind === "lab_result" && attachment.mimeType === "application/pdf")) {
    const canEmbed =
      !small && href.startsWith("data:application/pdf") && href.length < 2_500_000;
    if (canEmbed) {
      return (
        <div className="mb-1 min-w-0 max-w-[280px]">
          <object
            data={href}
            type="application/pdf"
            title={attachment.name}
            className="h-[128px] w-full rounded-md border border-gray-200 bg-gray-50"
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
            >
              Abrir PDF
            </a>
          </object>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs underline"
          >
            <span aria-hidden>{kind === "lab_result" ? "🧪" : "📄"}</span>
            <span className="truncate">{attachment.name}</span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium no-underline ${badge.color}`}
            >
              {badge.label}
            </span>
          </a>
        </div>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs underline mb-1"
      >
        <span aria-hidden>{kind === "lab_result" ? "🧪" : "📄"}</span>
        <span className="truncate max-w-[180px]">{attachment.name}</span>
        {!small && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium no-underline ${badge.color}`}
          >
            {badge.label}
          </span>
        )}
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
      <span className="truncate max-w-[180px]">{attachment.name}</span>
    </a>
  );
}
