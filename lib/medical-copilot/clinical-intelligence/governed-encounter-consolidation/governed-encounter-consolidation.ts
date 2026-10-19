export const GOVERNED_ENCOUNTER_CONSOLIDATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedEncounterConsolidationGovernance = typeof GOVERNED_ENCOUNTER_CONSOLIDATION_GOVERNANCE;

export type GovernedEncounterConsolidationComponentKey =
  | "encounterSnapshot"
  | "documentationPackage"
  | "physicianWorkspace";

export type GovernedEncounterConsolidationComponentPresence = {
  key: GovernedEncounterConsolidationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedEncounterConsolidationResult = {
  encounterSnapshot: unknown;
  documentationPackage: unknown;
  physicianWorkspace: unknown;
  components: GovernedEncounterConsolidationComponentPresence[];
  governance: GovernedEncounterConsolidationGovernance;
  reason: string | null;
};
