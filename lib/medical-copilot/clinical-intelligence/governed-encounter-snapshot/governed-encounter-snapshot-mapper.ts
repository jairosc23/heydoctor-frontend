import {
  GOVERNED_ENCOUNTER_SNAPSHOT_GOVERNANCE,
  type GovernedEncounterSnapshotComponentKey,
  type GovernedEncounterSnapshotComponentPresence,
  type GovernedEncounterSnapshotResult,
} from "./governed-encounter-snapshot";

const COMPONENT_DEFS: Array<{
  key: GovernedEncounterSnapshotComponentKey;
  label: string;
}> = [
  { key: "encounterReview", label: "Encounter Review" },
  { key: "clinicalEncounter", label: "Clinical Encounter" },
];

export function mapGovernedEncounterSnapshotEnvelope(
  payload: unknown,
): GovernedEncounterSnapshotResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.encounterReview !== undefined ||
    root.clinicalEncounter !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedEncounterSnapshotComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    encounterReview: data.encounterReview ?? null,
    clinicalEncounter: data.clinicalEncounter ?? null,
    components,
    governance: { ...GOVERNED_ENCOUNTER_SNAPSHOT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
