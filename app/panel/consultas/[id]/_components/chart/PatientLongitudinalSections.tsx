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

export function PersonalAntecedentsSection({
  profile,
  loading,
}: PatientLongitudinalSectionsProps) {
  const chronic = jsonLinesToList(profile?.chronicConditions);
  const surgeries = jsonLinesToList(profile?.surgeries);
  const trauma = jsonLinesToList(profile?.disabilities);
  const lines = mergeLines(chronic, surgeries, trauma);

  return (
    <ClinicalEncounterSection sectionNumber={4} title="Antecedentes personales">
      {loading ? (
        <p className="text-sm text-slate-500">Cargando antecedentes…</p>
      ) : (
        <ProfileTextBlock
          lines={lines}
          emptyLabel="Sin antecedentes personales registrados en la ficha del paciente."
        />
      )}
    </ClinicalEncounterSection>
  );
}

export function HabitualMedicationsSection({
  profile,
  loading,
}: PatientLongitudinalSectionsProps) {
  const lines = jsonLinesToList(profile?.medications);

  return (
    <ClinicalEncounterSection sectionNumber={5} title="Medicamentos habituales">
      {loading ? (
        <p className="text-sm text-slate-500">Cargando medicamentos…</p>
      ) : (
        <ProfileTextBlock
          lines={lines}
          emptyLabel="Sin medicamentos habituales registrados."
        />
      )}
    </ClinicalEncounterSection>
  );
}

export function AllergiesSection({
  profile,
  loading,
}: PatientLongitudinalSectionsProps) {
  const lines = jsonLinesToList(profile?.allergies);
  const hasAllergies = lines.length > 0;

  return (
    <ClinicalEncounterSection sectionNumber={6} title="Alergias">
      {loading ? (
        <p className="text-sm text-slate-500">Cargando alergias…</p>
      ) : hasAllergies ? (
        <div
          className={cn(
            "rounded-hd-md border border-red-200 bg-red-50 px-hd-3 py-hd-2",
          )}
          role="alert"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-800">
            Alerta clínica — alergias
          </p>
          <ProfileTextBlock lines={lines} emptyLabel="" />
        </div>
      ) : (
        <p className="text-sm text-emerald-800">
          Sin alergias documentadas en la ficha del paciente.
        </p>
      )}
    </ClinicalEncounterSection>
  );
}

export function HabitsSection({ profile, loading }: PatientLongitudinalSectionsProps) {
  const entries = HABIT_FIELDS.map(({ key, label }) => {
    const raw = profile?.[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return value ? `${label}: ${value}` : null;
  }).filter((line): line is string => Boolean(line));

  return (
    <ClinicalEncounterSection sectionNumber={7} title="Hábitos">
      {loading ? (
        <p className="text-sm text-slate-500">Cargando hábitos…</p>
      ) : (
        <ProfileTextBlock
          lines={entries}
          emptyLabel="Sin hábitos registrados (tabaco, alcohol, drogas, actividad física)."
        />
      )}
    </ClinicalEncounterSection>
  );
}

export function FamilyHistorySection({
  profile,
  loading,
}: PatientLongitudinalSectionsProps) {
  const lines = jsonLinesToList(profile?.familyHistory);

  return (
    <ClinicalEncounterSection sectionNumber={8} title="Antecedentes familiares">
      {loading ? (
        <p className="text-sm text-slate-500">Cargando antecedentes familiares…</p>
      ) : (
        <ProfileTextBlock
          lines={lines}
          emptyLabel="Sin antecedentes familiares registrados."
        />
      )}
    </ClinicalEncounterSection>
  );
}
