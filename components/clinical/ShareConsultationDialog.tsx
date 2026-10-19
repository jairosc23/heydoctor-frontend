"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { CLINICAL_OVERLAY_CLASS } from "@/lib/clinical-overlay-contract";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";

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

  useEffect(() => {
    if (!open) {
      clinicalWorkspaceKernel.dismiss("share");
      return;
    }
    clinicalWorkspaceKernel.present({
      id: "share",
      kind: "dialog",
      blocking: true,
      onDismiss: onClose,
      backdropAriaLabel: "Cerrar",
      backdropClassName: "bg-slate-900/55",
    });
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      clinicalWorkspaceKernel.dismiss("share");
    };
  }, []);

  if (!open) return null;

  const viewport = clinicalWorkspaceKernel.getViewport();

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
      className={`${CLINICAL_OVERLAY_CLASS.dialog} clinical-overlay-clinical-content pointer-events-none flex items-center justify-center px-4`}
      style={{
        paddingTop: viewport.safeTop,
        paddingBottom: viewport.safeBottom,
      }}
      data-testid="share-consultation-host"
      data-share-host="overlayHost"
      data-overlay-layer="dialog"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compartir teleconsulta"
        tabIndex={-1}
        style={modalStyle}
      >
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

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  width: "100%",
  maxWidth: 420,
  padding: 20,
  boxShadow: "0 25px 60px rgba(15,23,42,0.25)",
  pointerEvents: "auto",
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
