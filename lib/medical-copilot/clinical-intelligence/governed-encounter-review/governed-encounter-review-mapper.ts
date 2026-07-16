import {
  GOVERNED_ENCOUNTER_REVIEW_GOVERNANCE,
  type GovernedEncounterReviewComponentKey,
  type GovernedEncounterReviewComponentPresence,
  type GovernedEncounterReviewResult,
} from "./governed-encounter-review";

const COMPONENT_DEFS: Array<{
  key: GovernedEncounterReviewComponentKey;
  label: string;
}> = [
  { key: "encounterWorkspace", label: "Encounter Workspace" },
  { key: "reviewSession", label: "Review Session" },
];

export function mapGovernedEncounterReviewEnvelope(
  payload: unknown,
): GovernedEncounterReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.encounterWorkspace !== undefined ||
    root.reviewSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedEncounterReviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    encounterWorkspace: data.encounterWorkspace ?? null,
    reviewSession: data.reviewSession ?? null,
    components,
    governance: { ...GOVERNED_ENCOUNTER_REVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
