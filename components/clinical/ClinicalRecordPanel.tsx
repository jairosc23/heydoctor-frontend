"use client";

/**
 * Ficha cl\u00ednica estructurada para el detalle de la consulta:
 *   - Fecha / hora (read-only, derivada de createdAt/updatedAt).
 *   - Motivo de consulta (sincronizado con `chiefComplaint`).
 *   - Historia de enfermedad actual.
 *   - Revisi\u00f3n por sistemas (piel, digestivo, neurol\u00f3gico, respiratorio,
 *     cardiovascular, genitourinario).
 *
 * Este panel persiste internamente en `notes` (con marcador) para no
 * bloquear el frontend mientras el backend a\u00f1ade columnas dedicadas.
 *
 * Incluye bot\u00f3n "An\u00e1lisis cl\u00ednico con IA" para autollenado, con fallback
 * heur\u00edstico cuando el endpoint AI no responde.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  ClinicalRecord,
  SystemsReview,
  autofillClinicalRecord,
  parseClinicalRecord,
  serializeClinicalRecord,
} from "@/lib/services/clinical-record";

interface ClinicalRecordPanelProps {
  consultationId: string;
  /** Notas crudas del backend (campo `notes`). Se parsean al montar. */
  rawNotes: string | null | undefined;
  /** Motivo de consulta (chiefComplaint). */
  chiefComplaint: string;
  onChiefComplaintChange: (value: string) => void;
  /** Fecha de creaci\u00f3n para mostrar en cabecera. */
  createdAt?: string | null;
  /** \u00bfEl m\u00e9dico puede editar? (false cuando la consulta est\u00e1 firmada/locked) */
  editable: boolean;
  /** Datos del paciente para enriquecer el autollenado. */
  patient?: {
    name?: string | null;
    age?: number | null;
    sex?: string | null;
  } | null;
  /**
   * Handler para guardar. Recibe la cadena serializada lista para PATCH al
   * campo `notes` del backend, ms el chiefComplaint actual. La pgina padre
   * decide cmo mandarlo.
   */
  onSave: (payload: { notes: string; chiefComplaint: string }) => Promise<void>;
  /**
   * Cuando cambia este contador (>0), el panel ejecuta autom\u00e1ticamente el
   * autollenado con IA. \u00datil para integrar con la ActionBar superior.
   */
  autofillRequest?: number;
}

const SYSTEMS: { key: keyof SystemsReview; label: string }[] = [
  { key: "skin", label: "Piel" },
  { key: "digestive", label: "Digestivo" },
  { key: "neurological", label: "Neurol\u00f3gico" },
  { key: "respiratory", label: "Respiratorio" },
  { key: "cardiovascular", label: "Cardiovascular" },
  { key: "genitourinary", label: "Genitourinario" },
];

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#0f172a",
  display: "block",
  marginBottom: 6,
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  background: "white",
  fontFamily: "inherit",
};

function fmtDate(input?: string | null): string {
  if (!input) return "\u2014";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "\u2014";
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClinicalRecordPanel({
  consultationId,
  rawNotes,
  chiefComplaint,
  onChiefComplaintChange,
  createdAt,
  editable,
  patient,
  onSave,
  autofillRequest = 0,
}: ClinicalRecordPanelProps) {
  const initial = useMemo<ClinicalRecord>(
    () => parseClinicalRecord(rawNotes),
    [rawNotes],
  );

  const [record, setRecord] = useState<ClinicalRecord>(initial);
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [statusKind, setStatusKind] = useState<"info" | "success" | "error" | "warning">(
    "info",
  );

  /** Re-sincroniza si cambian las notas crudas externas. */
  useEffect(() => {
    setRecord(parseClinicalRecord(rawNotes));
  }, [rawNotes]);

  /** Disparo externo de autollenado IA (desde la ActionBar superior). */
  useEffect(() => {
    if (autofillRequest > 0) {
      void handleAutofill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autofillRequest]);

  function setSystem(key: keyof SystemsReview, value: string) {
    setRecord((r) => ({
      ...r,
      systemsReview: { ...r.systemsReview, [key]: value },
    }));
  }

  function flashStatus(kind: typeof statusKind, msg: string, ttl = 4500) {
    setStatusKind(kind);
    setStatusMsg(msg);
    if (ttl > 0) {
      window.setTimeout(() => setStatusMsg(""), ttl);
    }
  }

  async function handleAutofill() {
    if (!editable) return;
    setAiLoading(true);
    setStatusMsg("");
    try {
      const result = await autofillClinicalRecord(consultationId, {
        chiefComplaint,
        patientName: patient?.name ?? null,
        patientAge: patient?.age ?? null,
        patientSex: patient?.sex ?? null,
        currentRecord: record,
      });
      setRecord(result.record);
      if (result.source === "ai") {
        flashStatus(
          "success",
          "Propuesta generada con IA. Revisa y ajusta antes de guardar.",
        );
      } else {
        flashStatus(
          "warning",
          result.message ??
            "Mostramos una plantilla orientativa. Edita y completa antes de guardar.",
          7000,
        );
      }
    } catch (e) {
      flashStatus(
        "error",
        e instanceof Error
          ? `No se pudo generar el autollenado: ${e.message}`
          : "No se pudo generar el autollenado.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    if (!editable) return;
    setSaveLoading(true);
    setStatusMsg("");
    try {
      const notes = serializeClinicalRecord(record);
      await onSave({ notes, chiefComplaint: chiefComplaint.trim() });
      flashStatus("success", "Ficha cl\u00ednica guardada.");
    } catch (e) {
      flashStatus(
        "error",
        e instanceof Error ? `No se pudo guardar: ${e.message}` : "No se pudo guardar.",
      );
    } finally {
      setSaveLoading(false);
    }
  }

  const statusColors: Record<typeof statusKind, { bg: string; fg: string; bd: string }> = {
    info: { bg: "#f1f5f9", fg: "#334155", bd: "#cbd5e1" },
    success: { bg: "#ecfdf5", fg: "#065f46", bd: "#a7f3d0" },
    error: { bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
    warning: { bg: "#fffbeb", fg: "#92400e", bd: "#fde68a" },
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, color: "#0f766e" }}>
          Ficha cl\u00ednica
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleAutofill}
            disabled={!editable || aiLoading}
            title="Genera una propuesta de ficha cl\u00ednica con IA y la deja para que la edites."
            style={{
              padding: "8px 14px",
              background: aiLoading ? "#a78bfa" : "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: editable && !aiLoading ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: editable ? 1 : 0.6,
            }}
          >
            <span aria-hidden>\u2728</span>
            {aiLoading ? "Generando con IA\u2026" : "Autollenar con IA"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!editable || saveLoading}
            style={{
              padding: "8px 14px",
              background: saveLoading ? "#34d399" : "#0f766e",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: editable && !saveLoading ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 600,
              opacity: editable ? 1 : 0.6,
            }}
          >
            {saveLoading ? "Guardando\u2026" : "Guardar ficha"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <span style={labelStyle}>Fecha / hora</span>
          <p style={{ margin: 0, color: "#334155", fontSize: 14 }}>{fmtDate(createdAt)}</p>
        </div>
        <div>
          <span style={labelStyle}>Paciente</span>
          <p style={{ margin: 0, color: "#334155", fontSize: 14 }}>
            {patient?.name || "\u2014"}
            {patient?.age ? `, ${patient.age} a\u00f1os` : ""}
            {patient?.sex ? ` (${patient.sex})` : ""}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="cr-chief-complaint">
          Motivo de consulta
        </label>
        <input
          id="cr-chief-complaint"
          type="text"
          value={chiefComplaint}
          onChange={(e) => onChiefComplaintChange(e.target.value)}
          disabled={!editable}
          placeholder="Ej: Control de diabetes mellitus tipo 2"
          style={{
            ...inputBase,
            background: editable ? "white" : "#f8fafc",
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle} htmlFor="cr-hea">
          Historia de enfermedad actual
        </label>
        <textarea
          id="cr-hea"
          rows={4}
          value={record.presentIllnessHistory}
          onChange={(e) =>
            setRecord((r) => ({ ...r, presentIllnessHistory: e.target.value }))
          }
          disabled={!editable}
          placeholder="Evoluci\u00f3n del cuadro, s\u00edntomas, factores agravantes, tratamiento previo\u2026"
          style={{
            ...inputBase,
            resize: "vertical",
            background: editable ? "white" : "#f8fafc",
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 10px", fontSize: 14, color: "#0f766e" }}>
          Revisi\u00f3n por sistemas
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {SYSTEMS.map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle} htmlFor={`cr-sys-${key}`}>
                {label}
              </label>
              <textarea
                id={`cr-sys-${key}`}
                rows={2}
                value={record.systemsReview[key]}
                onChange={(e) => setSystem(key, e.target.value)}
                disabled={!editable}
                placeholder={`Hallazgos en ${label.toLowerCase()}\u2026`}
                style={{
                  ...inputBase,
                  resize: "vertical",
                  background: editable ? "white" : "#f8fafc",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {record.freeNotes ? (
        <div style={{ marginBottom: 8 }}>
          <span style={labelStyle}>Notas adicionales (legacy)</span>
          <p
            style={{
              margin: 0,
              padding: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 13,
              color: "#475569",
              whiteSpace: "pre-wrap",
            }}
          >
            {record.freeNotes}
          </p>
        </div>
      ) : null}

      {statusMsg ? (
        <div
          role="status"
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: statusColors[statusKind].bg,
            color: statusColors[statusKind].fg,
            border: `1px solid ${statusColors[statusKind].bd}`,
            fontSize: 13,
          }}
        >
          {statusMsg}
        </div>
      ) : null}
    </div>
  );
}

export default ClinicalRecordPanel;
