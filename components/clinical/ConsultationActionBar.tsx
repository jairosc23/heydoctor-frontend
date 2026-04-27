"use client";

/**
 * Barra de acciones del detalle de consulta. Reproduce el conjunto de
 * "chips" que muestra el panel de referencia: iniciar teleconsulta,
 * prescripci\u00f3n, factura, PDF, editar, an\u00e1lisis cl\u00ednico con IA, eliminar
 * y los documentos firmados (receta, certificado, interconsulta, premium).
 *
 * Cada bot\u00f3n es totalmente controlado: la p\u00e1gina padre decide qu\u00e9 hacer
 * (navegar, abrir modal, llamar al servicio) para no acoplar la UI a un
 * endpoint concreto. As\u00ed cada chip puede degradarse de forma independiente
 * con `disabled`/`loading`.
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
  /** Modo edici\u00f3n actual (cambia el label del bot\u00f3n "Editar"). */
  isEditing?: boolean;
  /** Link "Ver ficha del paciente" (opcional). */
  patientId?: string | null;
}

type Variant = "primary" | "secondary" | "danger" | "ghost" | "premium";

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: "#0f766e", fg: "white" },
  secondary: { bg: "#7dd3c5", fg: "#0f172a" },
  danger: { bg: "white", fg: "#b91c1c", border: "#fecaca" },
  ghost: { bg: "white", fg: "#0f172a", border: "#cbd5e1" },
  premium: { bg: "#0f172a", fg: "white" },
};

interface ChipProps {
  label: string;
  onClick: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  title?: string;
}

function Chip({ label, onClick, variant = "secondary", loading, disabled, icon, title }: ChipProps) {
  const colors = palette[variant];
  const inactive = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactive}
      title={title ?? label}
      style={{
        padding: "8px 14px",
        background: colors.bg,
        color: colors.fg,
        border: colors.border ? `1px solid ${colors.border}` : "none",
        borderRadius: 999,
        cursor: inactive ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 600,
        opacity: inactive ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "transform 120ms ease, opacity 120ms ease",
      }}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      <span>{loading ? "Procesando\u2026" : label}</span>
    </button>
  );
}

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
        gap: 10,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Chip
          label="Iniciar Teleconsulta"
          icon="\u{1F4F9}"
          variant="primary"
          loading={loading.starting}
          disabled={disabled.startTele}
          onClick={handlers.onStartTeleconsultation}
        />
        <Chip
          label="Prescripci\u00f3n"
          icon="\u{1F48A}"
          variant="secondary"
          disabled={disabled.prescription}
          onClick={handlers.onOpenPrescription}
        />
        <Chip
          label="Generar factura"
          icon="\u{1F9FE}"
          variant="secondary"
          loading={loading.invoice}
          disabled={disabled.invoice}
          onClick={handlers.onGenerateInvoice}
        />
        <Chip
          label="Descargar PDF"
          icon="\u{1F4C4}"
          variant="secondary"
          loading={loading.pdf}
          disabled={disabled.pdf}
          onClick={handlers.onDownloadPdf}
        />
        <Chip
          label={isEditing ? "Cerrar edici\u00f3n" : "Editar"}
          icon="\u270F\uFE0F"
          variant="secondary"
          disabled={disabled.edit}
          onClick={handlers.onToggleEdit}
        />
        <Chip
          label="An\u00e1lisis cl\u00ednico con IA"
          icon="\u2728"
          variant="primary"
          loading={loading.ai}
          disabled={disabled.ai}
          onClick={handlers.onAnalyzeWithAi}
        />
        <Chip
          label="Eliminar"
          icon="\u{1F5D1}\uFE0F"
          variant="danger"
          loading={loading.deleting}
          disabled={disabled.delete}
          onClick={handlers.onDelete}
          title="Eliminar consulta (requiere confirmaci\u00f3n)"
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Chip
          label="Generar Receta Firmada"
          icon="\u{1F4DD}"
          variant="secondary"
          loading={loading.signedPrescription}
          disabled={disabled.signedPrescription}
          onClick={handlers.onGenerateSignedPrescription}
        />
        <Chip
          label="Generar Certificado M\u00e9dico Firmado"
          icon="\u{1F4DC}"
          variant="secondary"
          loading={loading.signedCertificate}
          disabled={disabled.signedCertificate}
          onClick={handlers.onGenerateSignedCertificate}
        />
        <Chip
          label="Generar Interconsulta Firmada"
          icon="\u{1F91D}"
          variant="secondary"
          loading={loading.signedReferral}
          disabled={disabled.signedReferral}
          onClick={handlers.onGenerateSignedReferral}
        />
        <Chip
          label="Generar Documento Premium"
          icon="\u{1F451}"
          variant="premium"
          loading={loading.premium}
          disabled={disabled.premium}
          onClick={handlers.onGeneratePremiumDocument}
        />
      </div>
      {patientId ? (
        <div>
          <a
            href={`/panel/pacientes/${patientId}`}
            style={{
              fontSize: 13,
              color: "#0f766e",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Ver ficha del paciente \u2192
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default ConsultationActionBar;
