"use client";

import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500";

export interface TreatmentSectionProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
}

export function TreatmentSection({
  value,
  onChange,
  editable,
}: TreatmentSectionProps) {
  return (
    <ClinicalEncounterSection sectionNumber={13} title="Tratamiento">
      <label className="block text-xs">
        <span className="mb-1 block font-semibold text-slate-700">
          Plan terapéutico y medicación
        </span>
        <textarea
          id="soap-treatment"
          rows={4}
          className={INPUT_CLASS}
          value={value}
          disabled={!editable}
          placeholder="Medicamentos, procedimientos, indicaciones…"
          onChange={(e) => onChange(e.target.value)}
          data-testid="encounter-treatment"
        />
      </label>
    </ClinicalEncounterSection>
  );
}
