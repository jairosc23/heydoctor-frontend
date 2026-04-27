"use client";

/**
 * Barra de acciones del detalle de consulta (chips en dos filas).
 * Texto e iconos en UTF-8 explícito: evita secuencias `\u{...}` en JSX que en
 * algunos builds se mostraban literalmente en pantalla.
 */

import React from "react";

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
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
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
          label="Generar factura"
          icon="🧾"
          variant="mintOutline"
          loading={loading.invoice}
          disabled={disabled.invoice}
          onClick={handlers.onGenerateInvoice}
        />
        <Chip
          label="Descargar PDF"
          icon="📄"
          variant="mintOutline"
          loading={loading.pdf}
          disabled={disabled.pdf}
          onClick={handlers.onDownloadPdf}
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
        <Chip
          label="Eliminar"
          icon="🗑️"
          variant="deleteOutline"
          loading={loading.deleting}
          disabled={disabled.delete}
          onClick={handlers.onDelete}
          title="Eliminar consulta (requiere confirmación)"
        />
      </div>
      <div style={rowStyle}>
        <Chip
          label="Generar Receta Firmada"
          icon="📝"
          variant="tealSolid"
          loading={loading.signedPrescription}
          disabled={disabled.signedPrescription}
          onClick={handlers.onGenerateSignedPrescription}
        />
        <Chip
          label="Generar Certificado Médico Firmado"
          icon="📜"
          variant="tealSolid"
          loading={loading.signedCertificate}
          disabled={disabled.signedCertificate}
          onClick={handlers.onGenerateSignedCertificate}
        />
        <Chip
          label="Generar Interconsulta Firmada"
          icon="🤝"
          variant="tealSolid"
          loading={loading.signedReferral}
          disabled={disabled.signedReferral}
          onClick={handlers.onGenerateSignedReferral}
        />
        <Chip
          label="Generar Documento Premium"
          icon="👑"
          variant="premiumDark"
          loading={loading.premium}
          disabled={disabled.premium}
          onClick={handlers.onGeneratePremiumDocument}
        />
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

export default ConsultationActionBar;
