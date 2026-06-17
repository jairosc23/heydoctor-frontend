"use client";

import { jsonLinesToList } from "@/lib/patient-profile-display";
import type { PatientProfile } from "@/lib/services/patients";
import { cn } from "@/lib/utils";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";
import { ProfileTextBlock } from "./PatientProfileFields";

const HABIT_FIELDS: { key: keyof PatientProfile; label: string }[] = [
  { key: "smokingStatus", label: "Tabaco" },
  { key: "alcoholUse", label: "Alcohol" },
  { key: "drugUse", label: "Drogas" },
  { key: "exerciseFrequency", label: "Actividad física" },
];

function mergeLines(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const line of group) {
      if (!seen.has(line)) {
        seen.add(line);
        out.push(line);
      }
    }
  }
  return out;
}

export interface PatientLongitudinalSectionsProps {
  profile: PatientProfile | null;
  loading?: boolean;
}

function SectionSummary({
  label,
  lines,
  emptyLabel,
  critical,
}: {
  label: string;
  lines: string[];
  emptyLabel: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-hd-md border border-hd-border-subtle bg-white px-hd-3 py-hd-2",
        critical && "border-red-200 bg-red-50",
      )}
    >
      <p
        className={cn(
          "mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600",
          critical && "text-red-800",
        )}
      >
        {label}
      </p>
      <ProfileTextBlock lines={lines} emptyLabel={emptyLabel} />
    </div>
  );
}

export function PatientAntecedentsSection({
  profile,
  loading,
}: PatientLongitudinalSectionsProps) {
  const chronic = jsonLinesToList(profile?.chronicConditions);
  const surgeries = jsonLinesToList(profile?.surgeries);
  const trauma = jsonLinesToList(profile?.disabilities);
  const personalLines = mergeLines(chronic, surgeries, trauma);
  const medicationLines = jsonLinesToList(profile?.medications);
  const allergyLines = jsonLinesToList(profile?.allergies);
  const habitLines = HABIT_FIELDS.map(({ key, label }) => {
    const raw = profile?.[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return value ? `${label}: ${value}` : null;
  }).filter((line): line is string => Boolean(line));
  const familyLines = jsonLinesToList(profile?.familyHistory);
  const totalItems =
    personalLines.length +
    medicationLines.length +
    allergyLines.length +
    habitLines.length +
    familyLines.length;
  const hasAllergies = allergyLines.length > 0;

  return (
    <ClinicalEncounterSection
      sectionNumber={4}
      title="Antecedentes del paciente"
      id="encounter-section-4"
    >
      {loading ? (
        <p className="text-sm text-slate-500">Cargando antecedentes…</p>
      ) : (
        <details className="group" open={hasAllergies}>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-hd-2 rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-hd-3 py-hd-2 text-sm text-slate-700">
            <span>
              <span className="font-semibold">§4–§8 longitudinal</span>{" "}
              <span className="text-slate-500">
                {totalItems === 0
                  ? "sin datos registrados"
                  : `${totalItems} dato${totalItems === 1 ? "" : "s"} del perfil`}
              </span>
            </span>
            <span className="text-xs font-semibold text-primary group-open:hidden">
              Ver antecedentes
            </span>
            <span className="hidden text-xs font-semibold text-primary group-open:inline">
              Ocultar antecedentes
            </span>
          </summary>

          <div className="mt-hd-3 grid gap-hd-3 md:grid-cols-2">
            <SectionSummary
              label="§4 Antecedentes personales"
              lines={personalLines}
              emptyLabel="Sin antecedentes personales registrados."
            />
            <SectionSummary
              label="§5 Medicamentos habituales"
              lines={medicationLines}
              emptyLabel="Sin medicamentos habituales registrados."
            />
            <SectionSummary
              label="§6 Alergias"
              lines={allergyLines}
              emptyLabel="Sin alergias documentadas en la ficha del paciente."
              critical={hasAllergies}
            />
            <SectionSummary
              label="§7 Hábitos"
              lines={habitLines}
              emptyLabel="Sin hábitos registrados."
            />
            <SectionSummary
              label="§8 Antecedentes familiares"
              lines={familyLines}
              emptyLabel="Sin antecedentes familiares registrados."
            />
          </div>
        </details>
      )}
    </ClinicalEncounterSection>
  );
}
