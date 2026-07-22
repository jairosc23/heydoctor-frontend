"use client";

import { PrescriptionComposerLine } from "./PrescriptionComposerLine";
import type { SelectedMedication } from "@/lib/types/selected-medication";
import { emptySelectedMedication } from "@/lib/types/selected-medication";

export interface PrescriptionComposerProps {
  lines: SelectedMedication[];
  onChange: (lines: SelectedMedication[]) => void;
  patientId: string;
  consultationId?: string | null;
  diagnosis: string;
  onDiagnosisChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  error?: string | null;
  saving?: boolean;
  editing?: boolean;
  onSave: () => void;
  onCancelEdit?: () => void;
}

/**
 * PR-2 — Prescription Composer shell.
 * Works exclusively on SelectedMedication[]; persistence stays in the panel.
 */
export function PrescriptionComposer({
  lines,
  onChange,
  patientId,
  consultationId,
  diagnosis,
  onDiagnosisChange,
  notes,
  onNotesChange,
  error,
  saving,
  editing,
  onSave,
  onCancelEdit,
}: PrescriptionComposerProps) {
  const updateLine = (index: number, next: SelectedMedication) => {
    onChange(lines.map((line, i) => (i === index ? next : line)));
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) {
      onChange([emptySelectedMedication()]);
      return;
    }
    onChange(lines.filter((_, i) => i !== index));
  };

  const addLine = () => {
    onChange([...lines, emptySelectedMedication()]);
  };

  return (
    <div
      id="prescription-form"
      className="space-y-3"
      data-testid="prescription-composer"
    >
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
          <PrescriptionComposerLine
            key={`line-${index}`}
            line={line}
            index={index}
            patientId={patientId}
            consultationId={consultationId}
            onChange={(next) => updateLine(index, next)}
            onRemove={() => removeLine(index)}
            canRemove={lines.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addLine}
        className="rounded text-xs font-medium text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          {saving
            ? "Guardando…"
            : editing
              ? "Actualizar receta"
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
