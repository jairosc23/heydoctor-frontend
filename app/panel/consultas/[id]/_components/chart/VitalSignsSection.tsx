"use client";

import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import {
  computeBmi,
  normalizeClinicalVitalSigns,
} from "@/lib/clinical-vital-signs-context";
import { cn } from "@/lib/utils";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500";

type VitalField = keyof Pick<
  ClinicalVitalSigns,
  | "systolic"
  | "diastolic"
  | "heartRate"
  | "respiratoryRate"
  | "temperatureC"
  | "oxygenSaturation"
  | "weightKg"
  | "heightCm"
>;

const FIELDS: { key: VitalField; label: string; step?: string }[] = [
  { key: "systolic", label: "PA sistólica (mmHg)" },
  { key: "diastolic", label: "PA diastólica (mmHg)" },
  { key: "heartRate", label: "FC (lpm)" },
  { key: "respiratoryRate", label: "FR (rpm)" },
  { key: "oxygenSaturation", label: "SatO₂ (%)" },
  { key: "temperatureC", label: "Temp (°C)", step: "0.1" },
  { key: "weightKg", label: "Peso (kg)", step: "0.1" },
  { key: "heightCm", label: "Talla (cm o m)", step: "0.1" },
];

function parseNumberInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export interface VitalSignsSectionProps {
  vitals: ClinicalVitalSigns;
  onChange: (vitals: ClinicalVitalSigns) => void;
  editable: boolean;
  className?: string;
}

export function VitalSignsSection({
  vitals,
  onChange,
  editable,
  className,
}: VitalSignsSectionProps) {
  // Durante digitación no convertir m→cm; solo coerce finito + IMC preview.
  const live = normalizeClinicalVitalSigns(vitals, {
    convertHeightMetersToCm: false,
  });
  const displayHeight = vitals.heightCm ?? null;
  const bmi =
    live.bmi ??
    (live.weightKg != null && displayHeight != null
      ? computeBmi(live.weightKg, displayHeight)
      : null);

  const setField = (key: VitalField, raw: string) => {
    const next = { ...vitals, [key]: parseNumberInput(raw) };
    onChange(
      normalizeClinicalVitalSigns(next, { convertHeightMetersToCm: false }),
    );
  };

  const commitHeight = () => {
    onChange(
      normalizeClinicalVitalSigns(vitals, { convertHeightMetersToCm: true }),
    );
  };

  return (
    <ClinicalEncounterSection
      sectionNumber={9}
      title="Signos vitales"
      className={className}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map(({ key, label, step }) => {
          const value =
            key === "heightCm" ? (displayHeight ?? "") : (live[key] ?? "");
          return (
            <label key={key} className="block text-xs">
              <span className="mb-1 block font-semibold text-slate-700">
                {label}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step={step ?? "1"}
                className={INPUT_CLASS}
                value={value}
                disabled={!editable}
                onChange={(e) => setField(key, e.target.value)}
                onBlur={key === "heightCm" ? commitHeight : undefined}
                data-testid={`vital-${key}`}
              />
              {key === "heightCm" ? (
                <span
                  className="mt-1 block text-[11px] font-normal text-slate-500"
                  data-testid="vital-heightCm-hint"
                >
                  Puede indicar cm o metros; se confirma al salir del campo.
                </span>
              ) : null}
            </label>
          );
        })}
        <div className="block text-xs">
          <span className="mb-1 block font-semibold text-slate-700">IMC</span>
          <div
            className={cn(
              INPUT_CLASS,
              "flex items-center bg-slate-50 text-slate-700",
            )}
            data-testid="vital-bmi"
          >
            {bmi != null ? bmi : "—"}
          </div>
        </div>
      </div>
    </ClinicalEncounterSection>
  );
}
