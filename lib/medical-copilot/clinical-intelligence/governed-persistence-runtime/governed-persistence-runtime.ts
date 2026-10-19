export const GOVERNED_PERSISTENCE_RUNTIME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceRuntimeGovernance = typeof GOVERNED_PERSISTENCE_RUNTIME_GOVERNANCE;

export type GovernedPersistenceRuntimeComponentKey =
  | "persistenceSession"
  | "clinicalActivationRuntime";

export type GovernedPersistenceRuntimeComponentPresence = {
  key: GovernedPersistenceRuntimeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceRuntimeResult = {
  persistenceSession: unknown;
  clinicalActivationRuntime: unknown;
  components: GovernedPersistenceRuntimeComponentPresence[];
  governance: GovernedPersistenceRuntimeGovernance;
  reason: string | null;
};
