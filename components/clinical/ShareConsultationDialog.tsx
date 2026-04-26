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
    if (typeof window === "undefined") return;
    const origin = window.location.origin || "";
    setShareUrl(`${origin}/teleconsulta/${consultationId}`);
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
          <h2 style={titleStyle}>Compartir teleconsulta</h2>
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
          <input
            id="share-link"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            style={linkInputStyle}
          />
        </div>

        <div style={actionsStyle}>
          <button type="button" onClick={handleCopy} style={btnSecondaryStyle}>
            {copied ? "✓ Copiado" : "Copiar enlace"}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={btnPrimaryStyle}
          >
            Compartir por WhatsApp
          </a>
        </div>

        <p style={hintStyle}>
          El paciente debe iniciar sesión en HeyDoctor para acceder a la sala.
        </p>
      </div>
    </div>
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

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: "#0f172a",
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
  width: "100%",
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
  cursor: "pointer",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: "#94a3b8",
  textAlign: "center",
};
