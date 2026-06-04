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
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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
  { key: "neurological", label: "Neurológico" },
  { key: "respiratory", label: "Respiratorio" },
  { key: "cardiovascular", label: "Cardiovascular" },
  { key: "genitourinary", label: "Genitourinario" },
];

const labelClass =
  "mb-1.5 block text-sm font-semibold text-slate-900";
const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-[inherit] disabled:bg-slate-50";

function fmtDate(input?: string | null): string {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "—";
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
      flashStatus("success", "Ficha clínica guardada.");
    } catch (e) {
      flashStatus(
        "error",
        e instanceof Error ? `No se pudo guardar: ${e.message}` : "No se pudo guardar.",
      );
    } finally {
      setSaveLoading(false);
    }
  }

  const statusClass: Record<typeof statusKind, string> = {
    info: "border-slate-200 bg-slate-50 text-slate-700",
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-primary">Ficha clínica</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleAutofill()}
            disabled={!editable || aiLoading}
            title="Genera una propuesta de ficha clínica con IA y la deja para que la edites."
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white",
              aiLoading ? "bg-violet-400" : "bg-violet-600 hover:bg-violet-700",
              (!editable || aiLoading) && "cursor-not-allowed opacity-60",
            )}
          >
            <span aria-hidden>✨</span>
            {aiLoading ? "Generando con IA…" : "Autollenar con IA"}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!editable || saveLoading}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-semibold text-white",
              saveLoading ? "bg-teal-400" : "bg-primary hover:bg-primaryMid",
              (!editable || saveLoading) && "cursor-not-allowed opacity-60",
            )}
          >
            {saveLoading ? "Guardando…" : "Guardar ficha"}
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <span className={labelClass}>Fecha / hora</span>
          <p className="text-sm text-slate-700">{fmtDate(createdAt)}</p>
        </div>
        <div>
          <span className={labelClass}>Paciente</span>
          <p className="text-sm text-slate-700">
            {patient?.name || "—"}
            {patient?.age ? `, ${patient.age} años` : ""}
            {patient?.sex ? ` (${patient.sex})` : ""}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass} htmlFor="cr-chief-complaint">
          Motivo de consulta
        </label>
        <input
          id="cr-chief-complaint"
          type="text"
          value={chiefComplaint}
          onChange={(e) => onChiefComplaintChange(e.target.value)}
          disabled={!editable}
          placeholder="Ej: Control de diabetes mellitus tipo 2"
          className={cn(inputClass, !editable && "bg-slate-50")}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass} htmlFor="cr-hea">
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
          placeholder="Evolución del cuadro, síntomas, factores agravantes, tratamiento previo…"
          className={cn(inputClass, "resize-y", !editable && "bg-slate-50")}
        />
      </div>

      <div className="mb-4">
        <h4 className="mb-2.5 text-sm font-semibold text-primary">
          Revisión por sistemas
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {SYSTEMS.map(({ key, label }) => (
            <div key={key}>
              <label className={labelClass} htmlFor={`cr-sys-${key}`}>
                {label}
              </label>
              <textarea
                id={`cr-sys-${key}`}
                rows={2}
                value={record.systemsReview[key]}
                onChange={(e) => setSystem(key, e.target.value)}
                disabled={!editable}
                placeholder={`Hallazgos en ${label.toLowerCase()}…`}
                className={cn(inputClass, "resize-y", !editable && "bg-slate-50")}
              />
            </div>
          ))}
        </div>
      </div>

      {record.freeNotes ? (
        <div className="mb-2">
          <span className={labelClass}>Notas adicionales (legacy)</span>
          <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            {record.freeNotes}
          </p>
        </div>
      ) : null}

      {statusMsg ? (
        <div
          role="status"
          className={cn(
            "mt-2 rounded-lg border px-3 py-2 text-sm",
            statusClass[statusKind],
          )}
        >
          {statusMsg}
        </div>
      ) : null}
    </Card>
  );
}

export default ClinicalRecordPanel;
