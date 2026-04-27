"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

const QR_SIZE = 220;

interface ShareConsultationDialogProps {
  consultationId: string;
  open: boolean;
  patientName?: string;
  onClose: () => void;
}

/**
 * Resuelve la URL pública para que el paciente abra la teleconsulta. Prefiere
 * `NEXT_PUBLIC_APP_URL` (producción canónica, p.ej. `https://app.heydoctor.health`)
 * y cae a `window.location.origin` si no está configurada o si estamos en SSR
 * (que no debería ocurrir dentro de este componente, pero es defensivo).
 */
function resolveShareBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

/**
 * Diálogo para compartir el enlace de la teleconsulta con el paciente.
 *
 * - Calcula la URL pública del cliente sin depender de un endpoint backend:
 *   `${window.location.origin}/teleconsulta/{consultationId}`.
 * - Genera el QR localmente con `qrcode` (ya en deps).
 * - Ofrece botones para copiar enlace y abrir WhatsApp Web/App con el mensaje
 *   prerellenado. Si el QR falla, mostramos el enlace plano como fallback.
 */
export function ShareConsultationDialog({
  consultationId,
  open,
  patientName,
  onClose,
}: ShareConsultationDialogProps) {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const base = resolveShareBaseUrl();
    setShareUrl(`${base}/teleconsulta/${consultationId}`);
    if (process.env.NODE_ENV === "development") {
      console.debug("[heydoctor][share] base url", { base, consultationId });
    }
  }, [open, consultationId]);

  useEffect(() => {
    if (!open || !shareUrl) return;
    let cancelled = false;
    setQrError(null);
    QRCode.toDataURL(shareUrl, {
      width: QR_SIZE,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((data) => {
        if (!cancelled) setQrDataUrl(data);
      })
      .catch((e) => {
        if (cancelled) return;
        if (process.env.NODE_ENV === "development") {
          console.error("[heydoctor][share] QR error", e);
        }
        setQrDataUrl(null);
        setQrError("No se pudo generar el QR. Usa el enlace directo.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, shareUrl]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  if (!open) return null;

  const greeting = patientName?.trim() ? `Hola ${patientName.trim()},` : "Hola,";
  const message = `${greeting} aquí tienes el enlace para tu teleconsulta con HeyDoctor: ${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[heydoctor][share] clipboard error", e);
      }
      window.prompt("Copia este enlace:", shareUrl);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartir teleconsulta"
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modalStyle}>
        <header style={headerStyle}>
          <div style={titleWrapStyle}>
            <span style={titleIconStyle} aria-hidden>
              <QrIcon />
            </span>
            <h2 style={titleStyle}>Compartir teleconsulta</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={closeBtnStyle}
          >
            ×
          </button>
        </header>

        <p style={leadStyle}>
          Envía este enlace al paciente para que se una a la videollamada desde
          su teléfono o computador.
        </p>

        <div style={qrContainerStyle}>
          {qrDataUrl ? (
            <Image
              unoptimized
              src={qrDataUrl}
              width={QR_SIZE}
              height={QR_SIZE}
              alt="Código QR para unirse a la teleconsulta"
              style={{ display: "block", borderRadius: 8 }}
            />
          ) : qrError ? (
            <div style={{ padding: 16, textAlign: "center", color: "#92400e" }}>
              {qrError}
            </div>
          ) : (
            <span style={{ color: "#64748b", fontSize: 14 }}>Generando QR…</span>
          )}
        </div>

        <div style={linkBlockStyle}>
          <label style={linkLabelStyle} htmlFor="share-link">
            Enlace directo
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              id="share-link"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              style={linkInputStyle}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={iconBtnStyle}
              aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
              title={copied ? "Enlace copiado" : "Copiar enlace"}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        <div style={actionsStyle}>
          <button type="button" onClick={handleCopy} style={btnSecondaryStyle}>
            <span aria-hidden style={iconWrapStyle}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </span>
            {copied ? "Copiado" : "Copiar enlace"}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={btnPrimaryStyle}
          >
            <span aria-hidden style={iconWrapStyle}>
              <WhatsappIcon />
            </span>
            WhatsApp
          </a>
        </div>

        <p style={hintStyle}>
          El paciente debe iniciar sesión en HeyDoctor para acceder a la sala.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────── icons ─────────────────────────────── */

function QrIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3" />
      <path d="M21 14v3" />
      <path d="M14 21h3" />
      <path d="M21 21v-3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.42c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 60,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  width: "100%",
  maxWidth: 420,
  padding: 20,
  boxShadow: "0 25px 60px rgba(15,23,42,0.25)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};

const titleWrapStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const titleIconStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "#eef2ff",
  color: "#4f46e5",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: "#0f172a",
};

const iconWrapStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 6,
};

const iconBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 38,
  height: 38,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  cursor: "pointer",
  flexShrink: 0,
};

const closeBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 24,
  lineHeight: 1,
  cursor: "pointer",
  color: "#64748b",
};

const leadStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: 13,
  color: "#475569",
  lineHeight: 1.5,
};

const qrContainerStyle: React.CSSProperties = {
  width: QR_SIZE + 16,
  height: QR_SIZE + 16,
  margin: "0 auto 16px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const linkBlockStyle: React.CSSProperties = {
  marginBottom: 12,
};

const linkLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 6,
};

const linkInputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: 13,
  padding: "8px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#f8fafc",
  color: "#0f172a",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 8,
};

const btnSecondaryStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
};

const btnPrimaryStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  background: "#25d366",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  textAlign: "center",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  cursor: "pointer",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: "#94a3b8",
  textAlign: "center",
};
