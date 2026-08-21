"use client";

import { MedicationSuggestInput } from "./MedicationSuggestInput";
import type { SelectedMedication } from "@/lib/types/selected-medication";
import {
  emptyMagistralFormula,
  magistralMedicationFromQuery,
  manualMedicationFromQuery,
} from "@/lib/types/selected-medication";
import {
  applyComposerDisplayLabel,
  selectedMedicationFromSmartSuggestion,
} from "@/lib/prescription-composer";
import { calculateFromSelectedMedication } from "@/lib/prescription-calculation";

const FIELD =
  "w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50";

export interface PrescriptionComposerLineProps {
  line: SelectedMedication;
  index: number;
  patientId: string;
  consultationId?: string | null;
  onChange: (line: SelectedMedication) => void;
  onRemove: () => void;
  canRemove: boolean;
}

/**
 * PR-2/PR-3 — Structured prescription line (presentation-first).
 * Catalog identity lives in SelectedMedication.drugPresentationId.
 * Quantity math is delegated to the Calculation Engine (no math in UI).
 */
export function PrescriptionComposerLine({
  line,
  index,
  patientId,
  consultationId,
  onChange,
  onRemove,
  canRemove,
}: PrescriptionComposerLineProps) {
  const n = index + 1;
  const hasCatalog = Boolean(line.drugPresentationId);
  const source = line.source;
  const calculation = calculateFromSelectedMedication(line);

  return (
    <div
      className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/40 p-3"
      data-testid={`prescription-composer-line-${index}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Medicamento {n}
          {hasCatalog || source === "CATALOG" ? (
            <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium normal-case text-emerald-800">
              Catálogo
            </span>
          ) : null}
          {source === "MANUAL" ? (
            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-900">
              MANUAL
            </span>
          ) : null}
          {source === "MAGISTRAL" ? (
            <span className="ml-2 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-violet-900">
              MAGISTRAL
            </span>
          ) : null}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded text-xs text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label={`Quitar medicamento ${n}`}
          >
            Quitar
          </button>
        ) : null}
      </div>

      <MedicationSuggestInput
        value={line.displayLabel}
        patientId={patientId}
        consultationId={consultationId}
        placeholder="Buscar presentación…"
        onChange={(name) => onChange(applyComposerDisplayLabel(line, name))}
        onSelectPresentation={(suggestion) =>
          onChange(selectedMedicationFromSmartSuggestion(suggestion, line))
        }
        onCreateManual={(query) =>
          onChange({
            ...line,
            ...manualMedicationFromQuery(query),
            dosage: line.dosage,
            frequency: line.frequency,
            duration: line.duration,
            instructions: line.instructions,
            observations: line.observations,
          })
        }
        onCreateMagistral={(query) =>
          onChange({
            ...line,
            ...magistralMedicationFromQuery(query),
            dosage: line.dosage,
            frequency: line.frequency,
            duration: line.duration,
            instructions: line.instructions,
            observations: line.observations,
          })
        }
        inputClassName={FIELD}
      />

      {source !== "MANUAL" &&
      source !== "MAGISTRAL" &&
      (line.innName ||
        line.strengthDisplay ||
        line.dosageForm ||
        line.routeLabel ||
        line.routeCode) && (
        <div
          className="flex flex-wrap gap-1.5"
          data-testid={`prescription-composer-snapshot-${index}`}
        >
          {line.innName ? (
            <SnapshotChip label="Principio activo" value={line.innName} />
          ) : null}
          {line.strengthDisplay ? (
            <SnapshotChip label="Concentración" value={line.strengthDisplay} />
          ) : null}
          {line.dosageForm ? (
            <SnapshotChip label="Forma" value={line.dosageForm} />
          ) : null}
          {line.routeLabel || line.routeCode ? (
            <SnapshotChip
              label="Vía"
              value={line.routeLabel || line.routeCode || ""}
            />
          ) : null}
        </div>
      )}

      {source === "MANUAL" ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="block text-xs text-slate-600">
            <span className="mb-1 block font-medium">Concentración</span>
            <input
              type="text"
              value={line.strengthDisplay ?? ""}
              onChange={(e) =>
                onChange({ ...line, strengthDisplay: e.target.value })
              }
              className={FIELD}
            />
          </label>
          <label className="block text-xs text-slate-600">
            <span className="mb-1 block font-medium">Forma farmacéutica</span>
            <input
              type="text"
              value={line.dosageForm ?? ""}
              onChange={(e) =>
                onChange({ ...line, dosageForm: e.target.value })
              }
              className={FIELD}
            />
          </label>
        </div>
      ) : null}

      {source === "MAGISTRAL" ? (
        <div className="space-y-2 rounded-md border border-violet-100 bg-violet-50/50 p-2">
          {(line.magistral ?? emptyMagistralFormula()).components.map(
            (component, componentIndex) => (
              <div key={componentIndex} className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  className={FIELD}
                  placeholder="Ingrediente"
                  value={component.ingredient}
                  onChange={(e) => {
                    const magistral = line.magistral ?? emptyMagistralFormula();
                    onChange({
                      ...line,
                      magistral: {
                        ...magistral,
                        components: magistral.components.map((row, i) =>
                          i === componentIndex
                            ? { ...row, ingredient: e.target.value }
                            : row,
                        ),
                      },
                    });
                  }}
                />
                <input
                  type="text"
                  className={FIELD}
                  placeholder="Concentración"
                  value={component.concentration}
                  onChange={(e) => {
                    const magistral = line.magistral ?? emptyMagistralFormula();
                    onChange({
                      ...line,
                      magistral: {
                        ...magistral,
                        components: magistral.components.map((row, i) =>
                          i === componentIndex
                            ? { ...row, concentration: e.target.value }
                            : row,
                        ),
                      },
                    });
                  }}
                />
                <input
                  type="text"
                  className={FIELD}
                  placeholder="Unidad"
                  value={component.unit}
                  onChange={(e) => {
                    const magistral = line.magistral ?? emptyMagistralFormula();
                    onChange({
                      ...line,
                      magistral: {
                        ...magistral,
                        components: magistral.components.map((row, i) =>
                          i === componentIndex
                            ? { ...row, unit: e.target.value }
                            : row,
                        ),
                      },
                    });
                  }}
                />
              </div>
            ),
          )}
          <button
            type="button"
            className="text-xs font-medium text-violet-800"
            onClick={() => {
              const magistral = line.magistral ?? emptyMagistralFormula();
              onChange({
                ...line,
                magistral: {
                  ...magistral,
                  components: [
                    ...magistral.components,
                    { ingredient: "", concentration: "", unit: "" },
                  ],
                },
              });
            }}
          >
            + Agregar componente
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="block text-xs text-slate-600">
          <span className="mb-1 block font-medium">Dosis</span>
          <input
            type="text"
            value={line.dosage}
            onChange={(e) => onChange({ ...line, dosage: e.target.value })}
            aria-label={`Dosis del medicamento ${n}`}
            placeholder="Ej. 1 comprimido"
            className={FIELD}
          />
        </label>
        <label className="block text-xs text-slate-600">
          <span className="mb-1 block font-medium">Frecuencia</span>
          <input
            type="text"
            value={line.frequency}
            onChange={(e) => onChange({ ...line, frequency: e.target.value })}
            aria-label={`Frecuencia del medicamento ${n}`}
            placeholder="Ej. c/8 h · 1-0-1"
            className={FIELD}
          />
        </label>
        <label className="block text-xs text-slate-600">
          <span className="mb-1 block font-medium">Duración</span>
          <input
            type="text"
            value={line.duration}
            onChange={(e) => onChange({ ...line, duration: e.target.value })}
            aria-label={`Duración del medicamento ${n}`}
            placeholder="Ej. 7 días"
            className={FIELD}
          />
        </label>
      </div>

      {(calculation.status === "deterministic" ||
        calculation.status === "non_deterministic") && (
        <div
          className="space-y-1.5 rounded-md border border-teal-100 bg-teal-50/60 px-2.5 py-2"
          data-testid={`prescription-calculation-${index}`}
          aria-live="polite"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <CalcStat
              label="Cantidad total"
              value={calculation.display.quantity}
            />
            <CalcStat
              label="Consumo diario"
              value={calculation.display.dailyConsumption}
            />
            <CalcStat label="Duración" value={calculation.display.duration} />
          </div>
          {calculation.display.explanation !== "—" ? (
            <p
              className="text-[11px] text-teal-900/90"
              data-testid={`prescription-calculation-explanation-${index}`}
            >
              {calculation.display.explanation}
            </p>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block text-xs text-slate-600">
          <span className="mb-1 block font-medium">Instrucciones al paciente</span>
          <input
            type="text"
            value={line.instructions}
            onChange={(e) =>
              onChange({ ...line, instructions: e.target.value })
            }
            aria-label={`Instrucciones del medicamento ${n}`}
            placeholder="Ej. con alimentos"
            className={FIELD}
          />
        </label>
        <label className="block text-xs text-slate-600">
          <span className="mb-1 block font-medium">Observaciones</span>
          <input
            type="text"
            value={line.observations}
            onChange={(e) =>
              onChange({ ...line, observations: e.target.value })
            }
            aria-label={`Observaciones del medicamento ${n}`}
            placeholder="Notas clínicas de la línea"
            className={FIELD}
          />
        </label>
      </div>

      {!hasCatalog && line.displayLabel.trim() ? (
        <label className="block text-xs text-slate-600 sm:max-w-xs">
          <span className="mb-1 block font-medium">Vía (texto)</span>
          <input
            type="text"
            value={line.routeCode ?? ""}
            onChange={(e) =>
              onChange({
                ...line,
                routeCode: e.target.value,
                routeLabel: e.target.value,
              })
            }
            aria-label={`Vía del medicamento ${n}`}
            placeholder="Ej. oral"
            className={FIELD}
          />
        </label>
      ) : null}
    </div>
  );
}

function SnapshotChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700">
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

function CalcStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-teal-800/80">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-teal-950">{value}</p>
    </div>
  );
}
