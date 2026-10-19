export const GOVERNED_PERSISTENCE_READINESS_SESSION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessSessionGovernance = typeof GOVERNED_PERSISTENCE_READINESS_SESSION_GOVERNANCE;

export type GovernedPersistenceReadinessSessionComponentKey =
  | "persistenceReadinessDashboard"
  | "persistenceSession";

export type GovernedPersistenceReadinessSessionComponentPresence = {
  key: GovernedPersistenceReadinessSessionComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessSessionResult = {
  persistenceReadinessDashboard: unknown;
  persistenceSession: unknown;
  components: GovernedPersistenceReadinessSessionComponentPresence[];
  governance: GovernedPersistenceReadinessSessionGovernance;
  reason: string | null;
};
