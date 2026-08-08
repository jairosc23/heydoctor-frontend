"use client";

/**
 * MedicationOrderBuilder — ambulatory Orders/Prescription host (ADR-020 P1).
 * Works on MedicationOrderLine[]; persistence stays in PrescriptionPanel via adapter.
 */

import { MedicationOrderLineEditor } from "./MedicationOrderLineEditor";
import { PrescriptionSafetyPanel } from "@/components/clinical/safety/PrescriptionSafetyPanel";
import {
  emptyMedicationOrderLine,
  selectedMedicationsFromOrderLines,
  type JurisdictionCode,
  type MedicationOrderLine,
} from "@/lib/medication-domain";
import type {
  ClinicalDecisionState,
  SafetyProvider,
} from "@/lib/prescription-safety";
import type { AssistSessionBanner } from "@/components/clinical/PrescriptionComposer";

export type MedicationOrderBuilderProps = {
  lines: MedicationOrderLine[];
  onChange: (lines: MedicationOrderLine[]) => void;
  patientId: string;
  consultationId?: string | null;
  jurisdictionCode?: JurisdictionCode;
  diagnosis: string;
  onDiagnosisChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  error?: string | null;
  saving?: boolean;
  editing?: boolean;
  onSave: () => void;
  onCancelEdit?: () => void;
  safetyProvider?: SafetyProvider;
  onSafetyDecisionStateChange?: (state: ClinicalDecisionState) => void;
  assistSession?: AssistSessionBanner | null;
  confirmationGateChecked?: boolean;
  onConfirmationGateChange?: (checked: boolean) => void;
  assistEmitMode?: boolean;
};

export function MedicationOrderBuilder({
  lines,
  onChange,
  patientId,
  consultationId,
  jurisdictionCode = "CL",
  diagnosis,
  onDiagnosisChange,
  notes,
  onNotesChange,
  error,
  saving,
  editing,
  onSave,
  onCancelEdit,
  safetyProvider,
  onSafetyDecisionStateChange,
  assistSession,
  confirmationGateChecked = false,
  onConfirmationGateChange,
  assistEmitMode = false,
}: MedicationOrderBuilderProps) {
  const safetyLines = selectedMedicationsFromOrderLines(
    lines,
    jurisdictionCode,
  );

  const updateLine = (index: number, next: MedicationOrderLine) => {
    onChange(lines.map((line, i) => (i === index ? next : line)));
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) {
      onChange([emptyMedicationOrderLine("line-0", jurisdictionCode)]);
      return;
    }
    onChange(lines.filter((_, i) => i !== index));
  };

  const addLine = () => {
    onChange([
      ...lines,
      emptyMedicationOrderLine(`line-${Date.now()}`, jurisdictionCode),
    ]);
  };

  const gateBlocksEmit = assistEmitMode && !confirmationGateChecked;

  return (
    <div
      id="prescription-form"
      className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-4"
      data-testid="medication-order-builder"
      data-medication-domain="1"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Prescription Builder
          </h3>
          <p className="text-xs text-slate-500">
            Orden farmacológica estructurada · catálogo clínico
          </p>
        </div>
        <span className="rounded-full bg-teal-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          Enterprise
        </span>
      </div>
      {assistSession ? (
        <div
          className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900"
          data-testid="assist-session-banner"
          role="status"
        >
          <p className="font-medium">Asistencia de composición activa</p>
          <p className="mt-0.5 text-teal-800">
            Origen: {assistSession.sourceAssetType} ·{" "}
            {assistSession.sourceAssetId.slice(0, 8)}… / rev{" "}
            {assistSession.sourceRevisionId.slice(0, 8)}…
            {assistSession.physicianEdited ? " · editado por el médico" : ""}
          </p>
        </div>
      ) : null}

      <label className="block text-xs font-medium text-slate-600">
        Diagnóstico asociado
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => onDiagnosisChange(e.target.value)}
          aria-label="Diagnóstico de la receta"
          placeholder="Diagnóstico"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <div className="space-y-2">
        {lines.map((line, index) => (
          <MedicationOrderLineEditor
            key={line.id}
            line={line}
            index={index}
            patientId={patientId}
            consultationId={consultationId}
            jurisdictionCode={jurisdictionCode}
            onChange={(next) => updateLine(index, next)}
            onRemove={() => removeLine(index)}
            canRemove={lines.length > 1}
            disabled={saving}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addLine}
        disabled={saving}
        className="rounded text-xs font-medium text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        + Agregar medicamento
      </button>

      <label className="block text-xs font-medium text-slate-600">
        Observaciones de la receta
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          aria-label="Observaciones generales de la receta"
          placeholder="Notas adicionales de la receta"
          rows={2}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <PrescriptionSafetyPanel
        patientId={patientId}
        consultationId={consultationId}
        diagnosis={diagnosis}
        lines={safetyLines}
        provider={safetyProvider}
        onDecisionStateChange={onSafetyDecisionStateChange}
      />

      {assistEmitMode ? (
        <label
          className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800"
          data-testid="confirmation-gate"
        >
          <input
            type="checkbox"
            checked={confirmationGateChecked}
            onChange={(e) => onConfirmationGateChange?.(e.target.checked)}
            className="mt-0.5"
            aria-label="Confirmar emisión asistida"
            data-testid="confirmation-gate-checkbox"
          />
          <span>
            <span className="font-medium">Confirmation Gate (obligatorio):</span>{" "}
            confirmo el diagnóstico, medicamentos y notas; autorizo emitir por el
            único write path clínico.
          </span>
        </label>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || gateBlocksEmit}
          className="rounded bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          data-testid="composer-emit-button"
        >
          {saving
            ? "Guardando…"
            : editing
              ? "Actualizar receta"
              : assistEmitMode
                ? "Confirmar y emitir"
                : "Crear receta"}
        </button>
        {editing && onCancelEdit ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Cancelar edición
          </button>
        ) : null}
      </div>
    </div>
  );
}
