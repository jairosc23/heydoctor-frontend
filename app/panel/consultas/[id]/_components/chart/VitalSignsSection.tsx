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
  const normalized = normalizeClinicalVitalSigns(vitals);
  const bmi =
    normalized.bmi ??
    (normalized.weightKg != null && normalized.heightCm != null
      ? computeBmi(normalized.weightKg, normalized.heightCm)
      : null);

  const setField = (key: VitalField, raw: string) => {
    const next = { ...vitals, [key]: parseNumberInput(raw) };
    onChange(normalizeClinicalVitalSigns(next));
  };

  return (
    <ClinicalEncounterSection
      sectionNumber={9}
      title="Signos vitales"
      className={className}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map(({ key, label, step }) => (
          <label key={key} className="block text-xs">
            <span className="mb-1 block font-semibold text-slate-700">{label}</span>
            <input
              type="number"
              inputMode="decimal"
              step={step ?? "1"}
              className={INPUT_CLASS}
              value={normalized[key] ?? ""}
              disabled={!editable}
              onChange={(e) => setField(key, e.target.value)}
              data-testid={`vital-${key}`}
            />
          </label>
        ))}
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
