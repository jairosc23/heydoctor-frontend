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
  type MagistralFormula,
  type MedicationOrderLine,
} from "@/lib/medication-domain";
import {
  catalogBindingSurvivesLabelEdit,
  selectedMedicationFromSmartSuggestion,
} from "@/lib/prescription-composer";
import {
  emptyMagistralFormula,
  emptySelectedMedication,
  magistralMedicationFromQuery,
  manualMedicationFromQuery,
} from "@/lib/types/selected-medication";

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

function sourceBadge(source: string | undefined, hasCatalog: boolean) {
  if (source === "MANUAL") {
    return {
      label: "MANUAL",
      className:
        "rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-amber-100",
    };
  }
  if (source === "MAGISTRAL") {
    return {
      label: "MAGISTRAL",
      className:
        "rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900 ring-1 ring-violet-100",
    };
  }
  if (hasCatalog || source === "CATALOG") {
    return {
      label: "Catálogo",
      className:
        "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100",
    };
  }
  return null;
}

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
  const source = line.product.source;
  const badge = sourceBadge(source, hasCatalog);
  const calculation = calculateFromOrderLine(line, jurisdictionCode);
  const formula = line.product.magistral;

  const applySelected = (selected: ReturnType<typeof emptySelectedMedication>) => {
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
  };

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
          {badge ? <span className={badge.className}>{badge.label}</span> : null}
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
          onChange={(name) => {
            const keepCatalog =
              Boolean(line.product.drugPresentationId) &&
              catalogBindingSurvivesLabelEdit(line.product.displayLabel, name);
            onChange({
              ...line,
              product: keepCatalog
                ? { ...line.product, displayLabel: name }
                : {
                    ...line.product,
                    displayLabel: name,
                    source:
                      source === "MANUAL" || source === "MAGISTRAL"
                        ? source
                        : undefined,
                    drugPresentationId: undefined,
                    innName: undefined,
                    strengthDisplay:
                      source === "MANUAL"
                        ? line.product.strengthDisplay
                        : undefined,
                    doseForm:
                      source === "MANUAL" ? line.product.doseForm : undefined,
                    jurisdictionCode,
                    magistral:
                      source === "MAGISTRAL" ? line.product.magistral : undefined,
                  },
            });
          }}
          onSelectPresentation={(suggestion) => {
            const selected = selectedMedicationFromSmartSuggestion(
              suggestion,
              emptySelectedMedication(),
            );
            applySelected(selected);
          }}
          onCreateManual={(query) =>
            applySelected(manualMedicationFromQuery(query))
          }
          onCreateMagistral={(query) =>
            applySelected(magistralMedicationFromQuery(query))
          }
          inputClassName="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        />
        {(line.product.innName || line.product.strengthDisplay) &&
        source !== "MANUAL" ? (
          <p className="mt-2 text-xs text-slate-600">
            {[line.product.innName, line.product.strengthDisplay]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </div>

      {source === "MANUAL" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              Concentración
            </span>
            <input
              type="text"
              disabled={disabled}
              value={line.product.strengthDisplay ?? ""}
              onChange={(e) =>
                onChange({
                  ...line,
                  product: {
                    ...line.product,
                    strengthDisplay: e.target.value || undefined,
                  },
                })
              }
              placeholder="Opcional"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              Forma farmacéutica
            </span>
            <input
              type="text"
              disabled={disabled}
              value={line.product.doseForm ?? ""}
              onChange={(e) =>
                onChange({
                  ...line,
                  product: {
                    ...line.product,
                    doseForm: e.target.value || undefined,
                  },
                })
              }
              placeholder="Opcional"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              Vía
            </span>
            <input
              type="text"
              disabled={disabled}
              value={line.posology.route ?? line.product.routeCode ?? ""}
              onChange={(e) =>
                onChange({
                  ...line,
                  product: {
                    ...line.product,
                    routeCode: e.target.value || undefined,
                  },
                  posology: {
                    ...line.posology,
                    route: e.target.value || null,
                  },
                })
              }
              placeholder="Opcional"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
        </div>
      ) : null}

      {source === "MAGISTRAL" ? (
        <MagistralEditor
          formula={formula ?? emptyMagistralFormula()}
          disabled={disabled}
          onChange={(magistral) =>
            onChange({
              ...line,
              product: { ...line.product, source: "MAGISTRAL", magistral },
            })
          }
        />
      ) : null}

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
            {source === "MANUAL" || source === "MAGISTRAL"
              ? "Indicaciones de uso"
              : "Instrucciones al paciente"}
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

function MagistralEditor({
  formula,
  onChange,
  disabled,
}: {
  formula: MagistralFormula;
  onChange: (formula: MagistralFormula) => void;
  disabled?: boolean;
}) {
  const field =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";
  const updateComponent = (
    index: number,
    patch: Partial<MagistralFormula["components"][number]>,
  ) => {
    onChange({
      ...formula,
      components: formula.components.map((component, i) =>
        i === index ? { ...component, ...patch } : component,
      ),
    });
  };

  return (
    <div
      className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3"
      data-testid="magistral-editor"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-violet-900">
        Componentes de la fórmula
      </p>
      {formula.components.map((component, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-4">
          <input
            type="text"
            disabled={disabled}
            value={component.ingredient}
            placeholder="Ingrediente"
            className={field}
            onChange={(e) =>
              updateComponent(index, { ingredient: e.target.value })
            }
          />
          <input
            type="text"
            disabled={disabled}
            value={component.concentration}
            placeholder="Concentración"
            className={field}
            onChange={(e) =>
              updateComponent(index, { concentration: e.target.value })
            }
          />
          <input
            type="text"
            disabled={disabled}
            value={component.unit}
            placeholder="Unidad"
            className={field}
            onChange={(e) => updateComponent(index, { unit: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="text"
              disabled={disabled}
              value={component.quantity ?? ""}
              placeholder="Cantidad"
              className={field}
              onChange={(e) =>
                updateComponent(index, { quantity: e.target.value })
              }
            />
            {formula.components.length > 1 ? (
              <button
                type="button"
                disabled={disabled}
                className="text-xs text-red-600"
                onClick={() =>
                  onChange({
                    ...formula,
                    components: formula.components.filter((_, i) => i !== index),
                  })
                }
              >
                Quitar
              </button>
            ) : null}
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        className="text-xs font-medium text-violet-800 hover:underline"
        onClick={() =>
          onChange({
            ...formula,
            components: [
              ...formula.components,
              { ingredient: "", concentration: "", unit: "" },
            ],
          })
        }
      >
        + Agregar componente
      </button>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            Vehículo / base
          </span>
          <input
            type="text"
            disabled={disabled}
            value={formula.vehicle ?? ""}
            placeholder="Opcional"
            className={field}
            onChange={(e) =>
              onChange({ ...formula, vehicle: e.target.value || undefined })
            }
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            Cantidad final
          </span>
          <input
            type="text"
            disabled={disabled}
            value={formula.finalQuantity ?? ""}
            className={field}
            onChange={(e) =>
              onChange({
                ...formula,
                finalQuantity: e.target.value || undefined,
              })
            }
          />
        </label>
      </div>
    </div>
  );
}
