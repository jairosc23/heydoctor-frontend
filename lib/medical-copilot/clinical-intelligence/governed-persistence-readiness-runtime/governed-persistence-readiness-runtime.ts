export const GOVERNED_PERSISTENCE_READINESS_RUNTIME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessRuntimeGovernance = typeof GOVERNED_PERSISTENCE_READINESS_RUNTIME_GOVERNANCE;

export type GovernedPersistenceReadinessRuntimeComponentKey =
  | "persistenceReadinessSession"
  | "persistenceRuntime";

export type GovernedPersistenceReadinessRuntimeComponentPresence = {
  key: GovernedPersistenceReadinessRuntimeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessRuntimeResult = {
  persistenceReadinessSession: unknown;
  persistenceRuntime: unknown;
  components: GovernedPersistenceReadinessRuntimeComponentPresence[];
  governance: GovernedPersistenceReadinessRuntimeGovernance;
  reason: string | null;
};
