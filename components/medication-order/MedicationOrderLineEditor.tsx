"use client";

/**
 * Single MedicationOrderLine editor — Domain P1 (ADR-020).
 */

import { MedicationSuggestInput } from "@/components/clinical/MedicationSuggestInput";
import { PosologyFields } from "./PosologyFields";
import { PosologyPreview } from "./PosologyPreview";
import {
  calculateFromOrderLine,
  orderLineFromSelectedMedication,
  type JurisdictionCode,
  type MedicationOrderLine,
} from "@/lib/medication-domain";
import { selectedMedicationFromSmartSuggestion } from "@/lib/prescription-composer";
import { emptySelectedMedication } from "@/lib/types/selected-medication";

const FIELD =
  "w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50";

export type MedicationOrderLineEditorProps = {
  line: MedicationOrderLine;
  index: number;
  patientId: string;
  consultationId?: string | null;
  jurisdictionCode?: JurisdictionCode;
  onChange: (line: MedicationOrderLine) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
};

export function MedicationOrderLineEditor({
  line,
  index,
  patientId,
  consultationId,
  jurisdictionCode = "CL",
  onChange,
  onRemove,
  canRemove,
  disabled,
}: MedicationOrderLineEditorProps) {
  const n = index + 1;
  const hasCatalog = Boolean(line.product.drugPresentationId);
  const calculation = calculateFromOrderLine(line, jurisdictionCode);

  return (
    <div
      className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/40 p-3"
      data-testid={`medication-order-line-${index}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Medicamento {n}
          {hasCatalog ? (
            <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium normal-case text-emerald-800">
              Catálogo
            </span>
          ) : null}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded text-xs text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
            aria-label={`Quitar medicamento ${n}`}
          >
            Quitar
          </button>
        ) : null}
      </div>

      <MedicationSuggestInput
        value={line.product.displayLabel}
        patientId={patientId}
        consultationId={consultationId}
        placeholder="Buscar presentación…"
        onChange={(name) =>
          onChange({
            ...line,
            product: {
              ...line.product,
              displayLabel: name,
              drugPresentationId: undefined,
              innName: undefined,
              strengthDisplay: undefined,
              doseForm: undefined,
              jurisdictionCode,
            },
          })
        }
        onSelectPresentation={(suggestion) => {
          const selected = selectedMedicationFromSmartSuggestion(
            suggestion,
            emptySelectedMedication(),
          );
          const next = orderLineFromSelectedMedication(
            selected,
            line.id,
            jurisdictionCode,
          );
          onChange({
            ...next,
            posology: {
              ...line.posology,
              route: next.posology.route ?? line.posology.route,
            },
            patientInstructions: line.patientInstructions,
            clinicalNotes: line.clinicalNotes,
          });
        }}
        inputClassName={FIELD}
      />

      {(line.product.innName ||
        line.product.strengthDisplay ||
        line.product.doseForm) && (
        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
          {line.product.innName ? (
            <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">
              {line.product.innName}
            </span>
          ) : null}
          {line.product.strengthDisplay ? (
            <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">
              {line.product.strengthDisplay}
            </span>
          ) : null}
          {line.product.doseForm ? (
            <span className="rounded bg-white px-1.5 py-0.5 ring-1 ring-slate-200">
              {line.product.doseForm}
            </span>
          ) : null}
        </div>
      )}

      <PosologyFields
        value={line.posology}
        jurisdictionCode={jurisdictionCode}
        disabled={disabled}
        idPrefix={`order-line-${index}`}
        onChange={(posology) => onChange({ ...line, posology })}
      />

      <PosologyPreview
        product={line.product}
        posology={line.posology}
        patientInstructions={line.patientInstructions}
        clinicalNotes={line.clinicalNotes}
        jurisdictionCode={jurisdictionCode}
      />

      {calculation.status === "deterministic" && calculation.explanation ? (
        <p
          className="text-[11px] text-slate-600"
          data-testid={`medication-order-calc-${index}`}
        >
          Cantidad estimada: {calculation.explanation.formula}
        </p>
      ) : null}

      <label className="block text-xs text-slate-600">
        Instrucciones al paciente
        <input
          type="text"
          className={`${FIELD} mt-0.5`}
          disabled={disabled}
          value={line.patientInstructions ?? ""}
          onChange={(e) =>
            onChange({
              ...line,
              patientInstructions: e.target.value || undefined,
            })
          }
        />
      </label>

      <label className="block text-xs text-slate-600">
        Observaciones clínicas
        <input
          type="text"
          className={`${FIELD} mt-0.5`}
          disabled={disabled}
          value={line.clinicalNotes ?? ""}
          onChange={(e) =>
            onChange({
              ...line,
              clinicalNotes: e.target.value || undefined,
            })
          }
        />
      </label>
    </div>
  );
}
