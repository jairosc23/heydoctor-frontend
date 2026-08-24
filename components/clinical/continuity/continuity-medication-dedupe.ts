import type { ContinuityActiveMedication } from "@/lib/continuity-platform/types";

function normalizeMedToken(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function medicationKey(medication: ContinuityActiveMedication): string {
  return `${normalizeMedToken(medication.medicationName)}|${normalizeMedToken(medication.dosage)}`;
}

/**
 * D6 — drop duplicate active rows (same name + dose) and names already
 * shown in the shared Clinical Snapshot so Continuity does not list Losartan twice.
 */
export function visibleContinuityMedications(
  medications: ContinuityActiveMedication[],
  snapshotMedicationNames: string[] = [],
): ContinuityActiveMedication[] {
  const alreadyShown = new Set(
    snapshotMedicationNames.map((name) => normalizeMedToken(name)).filter(Boolean),
  );
  const seen = new Set<string>();
  const unique: ContinuityActiveMedication[] = [];
  for (const medication of medications) {
    const key = medicationKey(medication);
    if (!key.startsWith("|") && seen.has(key)) continue;
    const nameKey = normalizeMedToken(medication.medicationName);
    if (nameKey && alreadyShown.has(nameKey)) continue;
    seen.add(key);
    unique.push(medication);
  }
  return unique;
}
