"use client";

import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500";

export interface AnamnesisSectionProps {
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
}

export function AnamnesisSection({
  value,
  onChange,
  editable,
}: AnamnesisSectionProps) {
  return (
    <ClinicalEncounterSection sectionNumber={3} title="Anamnesis próxima">
      <label className="block text-xs">
        <span className="mb-1 block font-semibold text-slate-700">
          Historia de la enfermedad actual
        </span>
        <textarea
          rows={5}
          className={INPUT_CLASS}
          value={value}
          disabled={!editable}
          placeholder="Inicio, evolución, síntomas asociados, tratamientos previos…"
          onChange={(e) => onChange(e.target.value)}
          data-testid="anamnesis-present-illness"
        />
      </label>
    </ClinicalEncounterSection>
  );
}
