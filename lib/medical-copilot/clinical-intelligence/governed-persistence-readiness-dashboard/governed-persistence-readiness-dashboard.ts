export const GOVERNED_PERSISTENCE_READINESS_DASHBOARD_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessDashboardGovernance = typeof GOVERNED_PERSISTENCE_READINESS_DASHBOARD_GOVERNANCE;

export type GovernedPersistenceReadinessDashboardComponentKey =
  | "persistenceReadinessTimeline"
  | "persistenceDashboard";

export type GovernedPersistenceReadinessDashboardComponentPresence = {
  key: GovernedPersistenceReadinessDashboardComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessDashboardResult = {
  persistenceReadinessTimeline: unknown;
  persistenceDashboard: unknown;
  components: GovernedPersistenceReadinessDashboardComponentPresence[];
  governance: GovernedPersistenceReadinessDashboardGovernance;
  reason: string | null;
};
