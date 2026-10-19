"use client";

/**
 * Structured posology fields — enterprise comboboxes (ADR-020).
 * No free-text when a catalog exists.
 */

import { CatalogCombobox } from "./CatalogCombobox";
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

export type PosologyFieldsProps = {
  value: StructuredPosology;
  onChange: (next: StructuredPosology) => void;
  /** Pharmaceutical form (presentation) — stored on product, edited here for UX. */
  doseFormCode?: string | null;
  onDoseFormChange?: (code: string | null) => void;
  jurisdictionCode?: JurisdictionCode;
  disabled?: boolean;
  idPrefix?: string;
};

export function PosologyFields({
  value,
  onChange,
  doseFormCode = null,
  onDoseFormChange,
  jurisdictionCode = "CL",
  disabled,
  idPrefix = "posology",
}: PosologyFieldsProps) {
  const catalog = getCatalog(jurisdictionCode);
  const { locale } = catalog;
  const freqCode = frequencyCodeFromSpec(value.frequency) ?? "";
  const durCode = durationCodeFromSpec(value.duration) ?? "";
  const dosePreset =
    value.dose != null ? `${value.dose.amount}|${value.dose.unit}` : "";

  const doseEntries = catalog.doseAmountPresets.map((p) => {
    const unitEntry = catalog.doseUnits.find((u) => u.code === p.unit);
    const unitLabel = unitEntry ? labelFor(unitEntry, locale) : p.unit;
    return {
      code: `${p.amount}|${p.unit}`,
      labelEs: `${p.amount} ${unitLabel}`,
      labelEn: `${p.amount} ${unitLabel}`,
    };
  });

  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      data-testid="medication-posology-fields"
      data-jurisdiction={jurisdictionCode}
    >
      {onDoseFormChange ? (
        <div className="sm:col-span-2">
          <CatalogCombobox
            id={`${idPrefix}-presentation`}
            data-testid="posology-presentation"
            label="Presentación"
            entries={catalog.doseForms}
            valueCode={doseFormCode}
            onChangeCode={onDoseFormChange}
            locale={locale}
            placeholder="Buscar presentación…"
            disabled={disabled}
            emptyLabel="Seleccionar presentación…"
          />
        </div>
      ) : null}

      <CatalogCombobox
        id={`${idPrefix}-dose`}
        data-testid="posology-dose"
        label="Dosis"
        entries={doseEntries}
        valueCode={dosePreset || null}
        onChangeCode={(code) => {
          if (!code) {
            onChange({ ...value, dose: null });
            return;
          }
          const [amountStr, unit] = code.split("|");
          onChange({
            ...value,
            dose: { amount: Number(amountStr), unit },
          });
        }}
        locale={locale}
        placeholder="Buscar dosis…"
        disabled={disabled}
        emptyLabel="Seleccionar dosis…"
      />

      <CatalogCombobox
        id={`${idPrefix}-frequency`}
        data-testid="posology-frequency"
        label="Frecuencia"
        entries={catalog.frequencies}
        valueCode={freqCode || null}
        onChangeCode={(code) => {
          if (!code) {
            onChange({
              ...value,
              frequency: null,
              asNeeded: undefined,
            });
            return;
          }
          if (code === "PRN") {
            onChange({
              ...value,
              frequency: { kind: "CUSTOM", code: "PRN" },
              asNeeded: { conditionCode: "as_needed" },
            });
            return;
          }
          onChange({
            ...value,
            frequency: frequencySpecFromCode(code),
            asNeeded: undefined,
          });
        }}
        locale={locale}
        placeholder="Buscar frecuencia…"
        disabled={disabled}
        emptyLabel="Seleccionar frecuencia…"
      />

      <CatalogCombobox
        id={`${idPrefix}-duration`}
        data-testid="posology-duration"
        label="Duración"
        entries={catalog.durations}
        valueCode={durCode || null}
        onChangeCode={(code) => {
          onChange({
            ...value,
            duration: code ? durationSpecFromCode(code) : null,
          });
        }}
        locale={locale}
        placeholder="Buscar duración…"
        disabled={disabled}
        emptyLabel="Seleccionar duración…"
      />

      <CatalogCombobox
        id={`${idPrefix}-route`}
        data-testid="posology-route"
        label="Vía"
        entries={catalog.routes}
        valueCode={value.route}
        onChangeCode={(code) => onChange({ ...value, route: code })}
        locale={locale}
        placeholder="Buscar vía…"
        disabled={disabled}
        emptyLabel="Seleccionar vía…"
      />

      <div className="sm:col-span-2">
        <CatalogCombobox
          id={`${idPrefix}-timing`}
          data-testid="posology-timing"
          label="Indicaciones"
          entries={catalog.timingInstructions}
          valueCode={value.timingInstructions[0] ?? null}
          onChangeCode={(code) =>
            onChange({
              ...value,
              timingInstructions: code ? [code] : [],
            })
          }
          locale={locale}
          placeholder="Buscar indicación…"
          disabled={disabled}
          emptyLabel="Sin indicación adicional…"
        />
      </div>
    </div>
  );
}
