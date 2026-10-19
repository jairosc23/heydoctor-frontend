/**
 * Encounter antecedents flush payload — preserve surgeries/disabilities.
 * PR-A: never wipe those columns by consolidating the merged "personales" editor
 * into chronicConditions alone.
 */

import {
  jsonLinesToList,
  textToJsonLines,
} from "@/lib/patient-profile-display";
import {
  habitsToPayload,
  type PatientHabitDraft,
} from "@/lib/patient-profile-habits";
import type { PatientProfile } from "@/lib/services/patients";

export type AntecedentsFlushDraft = {
  personalText: string;
  medicationsText: string;
  allergiesText: string;
  familyText: string;
} & PatientHabitDraft;

export type AntecedentsFlushProfileSlice = Pick<
  PatientProfile,
  "surgeries" | "disabilities"
> | null;

/** Non-empty lines from the personales textarea (display order). */
export function personalLinesFromText(personalText: string): string[] {
  return personalText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Split merged personales into chronic / surgeries / disabilities for PUT.
 * - Lines that still match prior surgeries stay in `surgeries` (not copied to chronic).
 * - Same for disabilities.
 * - Remaining lines → chronicConditions.
 * - A column is only emptied when the user removed those lines from the editor
 *   (intentional), never as a side-effect of consolidation.
 */
export function partitionPersonalAntecedents(
  personalText: string,
  profile: AntecedentsFlushProfileSlice,
): {
  chronicConditions: Record<string, unknown>[];
  surgeries: Record<string, unknown>[];
  disabilities: Record<string, unknown>[];
} {
  const desired = personalLinesFromText(personalText);
  const prevSurgeries = jsonLinesToList(profile?.surgeries);
  const prevDisabilities = jsonLinesToList(profile?.disabilities);

  const nextSurgeries = prevSurgeries.filter((line) => desired.includes(line));
  const nextDisabilities = prevDisabilities.filter((line) =>
    desired.includes(line),
  );
  const reserved = new Set([...nextSurgeries, ...nextDisabilities]);
  const nextChronic = desired.filter((line) => !reserved.has(line));

  return {
    chronicConditions: textToJsonLines(nextChronic.join("\n")),
    surgeries: textToJsonLines(nextSurgeries.join("\n")),
    disabilities: textToJsonLines(nextDisabilities.join("\n")),
  };
}

export function buildAntecedentsFlushPayload(
  draft: AntecedentsFlushDraft,
  profile: AntecedentsFlushProfileSlice,
): Pick<
  PatientProfile,
  | "chronicConditions"
  | "surgeries"
  | "disabilities"
  | "medications"
  | "allergies"
  | "familyHistory"
  | "smokingStatus"
  | "alcoholUse"
  | "drugUse"
  | "exerciseFrequency"
> {
  const personal = partitionPersonalAntecedents(draft.personalText, profile);
  return {
    ...personal,
    medications: textToJsonLines(draft.medicationsText),
    allergies: textToJsonLines(draft.allergiesText),
    familyHistory: textToJsonLines(draft.familyText),
    ...habitsToPayload(draft),
  };
}
