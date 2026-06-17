"use client";

import { ClinicalMemoryCard } from "../memory/ClinicalMemoryCard";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ActiveProblemsSectionProps {
  patientId: string | null | undefined;
  encounterDiagnosis?: string | null;
  allergyLines?: string[];
}

export function ActiveProblemsSection({
  patientId,
  encounterDiagnosis,
  allergyLines = [],
}: ActiveProblemsSectionProps) {
  if (!patientId) {
    return (
      <ClinicalEncounterSection sectionNumber={12} title="Problemas activos">
        <p className="text-sm text-slate-500">
          Sin paciente asociado a esta consulta.
        </p>
      </ClinicalEncounterSection>
    );
  }

  return (
    <ClinicalEncounterSection sectionNumber={12} title="Problemas activos">
      <ClinicalMemoryCard
        patientId={patientId}
        encounterDiagnosis={encounterDiagnosis}
        allergyLines={allergyLines}
        compact
      />
    </ClinicalEncounterSection>
  );
}
