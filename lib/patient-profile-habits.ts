import type { PatientProfile } from "@/lib/services/patients";

/** Habit fields are DTO strings — never JSONB `{ label }` arrays (PR #97). */
export const PATIENT_HABIT_FIELDS = [
  { key: "smokingStatus", label: "Tabaco" },
  { key: "alcoholUse", label: "Alcohol" },
  { key: "drugUse", label: "Drogas" },
  { key: "exerciseFrequency", label: "Actividad física" },
] as const;

export type PatientHabitKey = (typeof PATIENT_HABIT_FIELDS)[number]["key"];

export type PatientHabitDraft = Record<PatientHabitKey, string>;

export type PatientHabitPayload = Pick<PatientProfile, PatientHabitKey>;

export function emptyHabitDraft(): PatientHabitDraft {
  return {
    smokingStatus: "",
    alcoholUse: "",
    drugUse: "",
    exerciseFrequency: "",
  };
}

export function habitsFromProfile(
  profile: PatientProfile | null | undefined,
): PatientHabitDraft {
  const next = emptyHabitDraft();
  for (const { key } of PATIENT_HABIT_FIELDS) {
    const raw = profile?.[key];
    next[key] = typeof raw === "string" ? raw : "";
  }
  return next;
}

export function normalizeHabitValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function habitsToPayload(draft: PatientHabitDraft): PatientHabitPayload {
  return {
    smokingStatus: normalizeHabitValue(draft.smokingStatus),
    alcoholUse: normalizeHabitValue(draft.alcoholUse),
    drugUse: normalizeHabitValue(draft.drugUse),
    exerciseFrequency: normalizeHabitValue(draft.exerciseFrequency),
  };
}

export function habitLinesFromProfile(
  profile: PatientProfile | null | undefined,
): string[] {
  return PATIENT_HABIT_FIELDS.map(({ key, label }) => {
    const raw = profile?.[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return value ? `${label}: ${value}` : null;
  }).filter((line): line is string => Boolean(line));
}
