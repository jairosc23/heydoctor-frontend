export const GOVERNED_PERSISTENCE_READINESS_CONSOLIDATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessConsolidationGovernance = typeof GOVERNED_PERSISTENCE_READINESS_CONSOLIDATION_GOVERNANCE;

export type GovernedPersistenceReadinessConsolidationComponentKey =
  | "persistenceReadinessValidation"
  | "clinicalExperiencePackage"
  | "clinicalWorkspacePackage";

export type GovernedPersistenceReadinessConsolidationComponentPresence = {
  key: GovernedPersistenceReadinessConsolidationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessConsolidationResult = {
  persistenceReadinessValidation: unknown;
  clinicalExperiencePackage: unknown;
  clinicalWorkspacePackage: unknown;
  components: GovernedPersistenceReadinessConsolidationComponentPresence[];
  governance: GovernedPersistenceReadinessConsolidationGovernance;
  reason: string | null;
};
