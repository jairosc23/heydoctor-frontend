"use client";

/**
 * Barra de acciones: acciones frecuentes visibles y resto en «Más acciones».
 */

import React, { useEffect, useRef, useState } from "react";

export interface ActionBarHandlers {
  onStartTeleconsultation: () => void;
  onOpenPrescription: () => void;
  onGenerateInvoice: () => void;
  onDownloadPdf: () => void;
  onToggleEdit: () => void;
  onAnalyzeWithAi: () => void;
  onDelete: () => void;
  onGenerateSignedPrescription: () => void;
  onGenerateSignedCertificate: () => void;
  onGenerateSignedReferral: () => void;
  onGeneratePremiumDocument: () => void;
}

export interface ActionBarLoading {
  starting?: boolean;
  invoice?: boolean;
  pdf?: boolean;
  ai?: boolean;
  deleting?: boolean;
  signedPrescription?: boolean;
  signedCertificate?: boolean;
  signedReferral?: boolean;
  premium?: boolean;
}

export interface ActionBarDisabled {
  startTele?: boolean;
  prescription?: boolean;
  invoice?: boolean;
  pdf?: boolean;
  edit?: boolean;
  ai?: boolean;
  delete?: boolean;
  signedPrescription?: boolean;
  signedCertificate?: boolean;
  signedReferral?: boolean;
  premium?: boolean;
}

interface ConsultationActionBarProps {
  handlers: ActionBarHandlers;
  loading?: ActionBarLoading;
  disabled?: ActionBarDisabled;
  isEditing?: boolean;
  patientId?: string | null;
}

type ChipVariant = "tealSolid" | "purpleSolid" | "mintOutline" | "aiDark" | "deleteOutline" | "premiumDark";

const chipStyles: Record<
  ChipVariant,
  { bg: string; fg: string; border: string }
> = {
  tealSolid: { bg: "#0d9488", fg: "#ffffff", border: "transparent" },
  purpleSolid: { bg: "#7c3aed", fg: "#ffffff", border: "transparent" },
  mintOutline: { bg: "#ccfbf1", fg: "#0f766e", border: "#99f6e4" },
  aiDark: { bg: "#312e81", fg: "#ffffff", border: "transparent" },
  deleteOutline: { bg: "#f8fafc", fg: "#475569", border: "#cbd5e1" },
  premiumDark: { bg: "#1e293b", fg: "#ffffff", border: "transparent" },
};

interface ChipProps {
  label: string;
  onClick: () => void;
  variant: ChipVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  title?: string;
}

function Chip({ label, onClick, variant, loading, disabled, icon, title }: ChipProps) {
  const c = chipStyles[variant];
  const inactive = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactive}
      title={title ?? label}
      style={{
        padding: "10px 16px",
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        borderRadius: 999,
        cursor: inactive ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 600,
        opacity: inactive ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        flex: "0 1 auto",
        maxWidth: "100%",
        whiteSpace: "normal",
        textAlign: "left",
        lineHeight: 1.25,
        boxSizing: "border-box",
        wordBreak: "break-word",
      }}
    >
      {icon ? (
        <span aria-hidden style={{ flexShrink: 0, fontSize: 15 }}>
          {icon}
        </span>
      ) : null}
      <span>{loading ? "Procesando…" : label}</span>
    </button>
  );
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "stretch",
  width: "100%",
  boxSizing: "border-box",
};

export function ConsultationActionBar({
  handlers,
  loading = {},
  disabled = {},
  isEditing,
  patientId,
}: ConsultationActionBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [moreOpen]);

  return (
    <div
      ref={wrapRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div style={rowStyle}>
        <Chip
          label="Iniciar Teleconsulta"
          icon="📹"
          variant="tealSolid"
          loading={loading.starting}
          disabled={disabled.startTele}
          onClick={handlers.onStartTeleconsultation}
        />
        <Chip
          label="Prescripción"
          icon="💊"
          variant="purpleSolid"
          disabled={disabled.prescription}
          onClick={handlers.onOpenPrescription}
        />
        <Chip
          label={isEditing ? "Cerrar edición" : "Editar"}
          icon="✏️"
          variant="mintOutline"
          disabled={disabled.edit}
          onClick={handlers.onToggleEdit}
        />
        <Chip
          label="Análisis clínico con IA"
          icon="✨"
          variant="aiDark"
          loading={loading.ai}
          disabled={disabled.ai}
          onClick={handlers.onAnalyzeWithAi}
        />
        <div style={{ position: "relative", display: "inline-flex" }}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid #94a3b8",
              background: "#f8fafc",
              color: "#334155",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Más acciones
            <span aria-hidden style={{ fontSize: 10 }}>
              ▾
            </span>
          </button>
          {moreOpen ? (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 6,
                minWidth: 280,
                maxWidth: "min(100vw - 32px, 340px)",
                background: "#fff",
                borderRadius: 12,
                boxShadow:
                  "0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
                zIndex: 50,
                padding: "8px 0",
              }}
            >
              <MenuBtn
                label="Generar factura"
                icon="🧾"
                loading={loading.invoice}
                disabled={disabled.invoice}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onGenerateInvoice();
                }}
              />
              <MenuBtn
                label="Descargar PDF"
                icon="📄"
                loading={loading.pdf}
                disabled={disabled.pdf}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onDownloadPdf();
                }}
              />
              <MenuBtn
                label="Generar receta firmada"
                icon="📝"
                loading={loading.signedPrescription}
                disabled={disabled.signedPrescription}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onGenerateSignedPrescription();
                }}
              />
              <MenuBtn
                label="Certificado médico firmado"
                icon="📜"
                loading={loading.signedCertificate}
                disabled={disabled.signedCertificate}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onGenerateSignedCertificate();
                }}
              />
              <MenuBtn
                label="Interconsulta firmada"
                icon="🤝"
                loading={loading.signedReferral}
                disabled={disabled.signedReferral}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onGenerateSignedReferral();
                }}
              />
              <MenuBtn
                label="Documento premium"
                icon="👑"
                loading={loading.premium}
                disabled={disabled.premium}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onGeneratePremiumDocument();
                }}
              />
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  marginTop: 4,
                  paddingTop: 4,
                }}
              />
              <MenuBtn
                label="Eliminar consulta…"
                icon="🗑️"
                danger
                loading={loading.deleting}
                disabled={disabled.delete}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onDelete();
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      {patientId ? (
        <div style={{ marginTop: 2 }}>
          <a
            href={`/panel/pacientes/${patientId}`}
            style={{
              fontSize: 13,
              color: "#0f766e",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Ver ficha del paciente →
          </a>
        </div>
      ) : null}
    </div>
  );
}

function MenuBtn({
  label,
  icon,
  onClick,
  loading,
  disabled,
  danger,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={inactive}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        border: "none",
        background: "transparent",
        cursor: inactive ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: danger ? "#b91c1c" : "#1e293b",
        textAlign: "left",
        opacity: inactive ? 0.5 : 1,
      }}
    >
      <span aria-hidden>{icon}</span>
      {loading ? "Procesando…" : label}
    </button>
  );
}

export default ConsultationActionBar;
