export const GOVERNED_ENCOUNTER_SNAPSHOT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedEncounterSnapshotGovernance = typeof GOVERNED_ENCOUNTER_SNAPSHOT_GOVERNANCE;

export type GovernedEncounterSnapshotComponentKey =
  | "encounterReview"
  | "clinicalEncounter";

export type GovernedEncounterSnapshotComponentPresence = {
  key: GovernedEncounterSnapshotComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedEncounterSnapshotResult = {
  encounterReview: unknown;
  clinicalEncounter: unknown;
  components: GovernedEncounterSnapshotComponentPresence[];
  governance: GovernedEncounterSnapshotGovernance;
  reason: string | null;
};
