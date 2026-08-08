"use client";

/**
 * Structured posology fields — Medication Domain P0 (ADR-020).
 * Codes only; display via catalog labels. No string-concatenation SSOT.
 */

import {
  durationCodeFromSpec,
  durationSpecFromCode,
  frequencyCodeFromSpec,
  frequencySpecFromCode,
  getCatalog,
  labelFor,
  type JurisdictionCode,
  type StructuredPosology,
} from "@/lib/medication-domain";

const FIELD =
  "w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50";

export type PosologyFieldsProps = {
  value: StructuredPosology;
  onChange: (next: StructuredPosology) => void;
  jurisdictionCode?: JurisdictionCode;
  disabled?: boolean;
  idPrefix?: string;
};

export function PosologyFields({
  value,
  onChange,
  jurisdictionCode = "CL",
  disabled,
  idPrefix = "posology",
}: PosologyFieldsProps) {
  const catalog = getCatalog(jurisdictionCode);
  const { locale } = catalog;
  const freqCode = frequencyCodeFromSpec(value.frequency) ?? "";
  const durCode = durationCodeFromSpec(value.duration) ?? "";
  const dosePreset =
    value.dose != null
      ? `${value.dose.amount}|${value.dose.unit}`
      : "";

  return (
    <div
      className="grid gap-2 sm:grid-cols-2"
      data-testid="medication-posology-fields"
      data-jurisdiction={jurisdictionCode}
    >
      <label className="block text-xs text-slate-600 sm:col-span-2">
        Dosis
        <select
          id={`${idPrefix}-dose`}
          className={`${FIELD} mt-0.5`}
          disabled={disabled}
          value={dosePreset}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) {
              onChange({ ...value, dose: null });
              return;
            }
            const [amountStr, unit] = raw.split("|");
            onChange({
              ...value,
              dose: { amount: Number(amountStr), unit },
            });
          }}
        >
          <option value="">Seleccionar dosis…</option>
          {catalog.doseAmountPresets.map((p) => {
            const unitEntry = catalog.doseUnits.find((u) => u.code === p.unit);
            const unitLabel = unitEntry
              ? labelFor(unitEntry, locale)
              : p.unit;
            return (
              <option key={`${p.amount}|${p.unit}`} value={`${p.amount}|${p.unit}`}>
                {p.amount} {unitLabel}
              </option>
            );
          })}
        </select>
      </label>

      <label className="block text-xs text-slate-600">
        Frecuencia
        <select
          id={`${idPrefix}-frequency`}
          className={`${FIELD} mt-0.5`}
          disabled={disabled}
          value={freqCode}
          onChange={(e) => {
            const code = e.target.value;
            onChange({
              ...value,
              frequency: code ? frequencySpecFromCode(code) : null,
            });
          }}
        >
          <option value="">Seleccionar frecuencia…</option>
          {catalog.frequencies.map((f) => (
            <option key={f.code} value={f.code}>
              {labelFor(f, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-600">
        Duración
        <select
          id={`${idPrefix}-duration`}
          className={`${FIELD} mt-0.5`}
          disabled={disabled}
          value={durCode}
          onChange={(e) => {
            const code = e.target.value;
            onChange({
              ...value,
              duration: code ? durationSpecFromCode(code) : null,
            });
          }}
        >
          <option value="">Seleccionar duración…</option>
          {catalog.durations.map((d) => (
            <option key={d.code} value={d.code}>
              {labelFor(d, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-600">
        Vía
        <select
          id={`${idPrefix}-route`}
          className={`${FIELD} mt-0.5`}
          disabled={disabled}
          value={value.route ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              route: e.target.value || null,
            })
          }
        >
          <option value="">Seleccionar vía…</option>
          {catalog.routes.map((r) => (
            <option key={r.code} value={r.code}>
              {labelFor(r, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-600 sm:col-span-2">
        Indicaciones
        <select
          id={`${idPrefix}-timing`}
          className={`${FIELD} mt-0.5`}
          disabled={disabled}
          value={value.timingInstructions[0] ?? ""}
          onChange={(e) => {
            const code = e.target.value;
            onChange({
              ...value,
              timingInstructions: code ? [code] : [],
            });
          }}
        >
          <option value="">Sin indicación adicional…</option>
          {catalog.timingInstructions.map((t) => (
            <option key={t.code} value={t.code}>
              {labelFor(t, locale)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
