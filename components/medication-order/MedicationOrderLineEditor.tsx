"use client";

/**
 * Single MedicationOrderLine editor — enterprise clinical UX (ADR-020).
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
    <section
      className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-900/5"
      data-testid={`medication-order-line-${index}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-800">
            Línea terapéutica {n}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Medicamento · presentación · posología estructurada
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasCatalog ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
              Catálogo
            </span>
          ) : null}
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
              aria-label={`Quitar medicamento ${n}`}
            >
              Quitar
            </button>
          ) : null}
        </div>
      </header>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
          Medicamento
        </label>
        <MedicationSuggestInput
          value={line.product.displayLabel}
          patientId={patientId}
          consultationId={consultationId}
          countryCode={jurisdictionCode}
          placeholder="Buscar medicamento o presentación…"
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
                route:
                  next.posology.route ??
                  suggestion.route?.code ??
                  line.posology.route,
              },
              patientInstructions: line.patientInstructions,
              clinicalNotes: line.clinicalNotes,
            });
          }}
          inputClassName="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        />
        {(line.product.innName || line.product.strengthDisplay) && (
          <p className="mt-2 text-xs text-slate-600">
            {[line.product.innName, line.product.strengthDisplay]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      <PosologyFields
        value={line.posology}
        doseFormCode={line.product.doseForm ?? null}
        onDoseFormChange={(code) =>
          onChange({
            ...line,
            product: { ...line.product, doseForm: code ?? undefined },
          })
        }
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
          className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-100"
          data-testid={`medication-order-calc-${index}`}
        >
          <span className="font-semibold text-slate-700">Cantidad estimada · </span>
          {calculation.explanation.formula}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            Instrucciones al paciente
          </span>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50"
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
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            Observaciones clínicas
          </span>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50"
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
    </section>
  );
}
