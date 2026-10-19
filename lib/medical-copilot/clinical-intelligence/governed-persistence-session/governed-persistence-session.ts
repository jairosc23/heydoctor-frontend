export const GOVERNED_PERSISTENCE_SESSION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceSessionGovernance = typeof GOVERNED_PERSISTENCE_SESSION_GOVERNANCE;

export type GovernedPersistenceSessionComponentKey =
  | "persistenceDashboard"
  | "clinicalActivationSession";

export type GovernedPersistenceSessionComponentPresence = {
  key: GovernedPersistenceSessionComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceSessionResult = {
  persistenceDashboard: unknown;
  clinicalActivationSession: unknown;
  components: GovernedPersistenceSessionComponentPresence[];
  governance: GovernedPersistenceSessionGovernance;
  reason: string | null;
};
