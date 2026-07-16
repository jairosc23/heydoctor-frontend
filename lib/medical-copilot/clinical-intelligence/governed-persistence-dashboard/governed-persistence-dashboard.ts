export const GOVERNED_PERSISTENCE_DASHBOARD_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceDashboardGovernance = typeof GOVERNED_PERSISTENCE_DASHBOARD_GOVERNANCE;

export type GovernedPersistenceDashboardComponentKey =
  | "persistenceNavigation"
  | "clinicalActivationDashboard";

export type GovernedPersistenceDashboardComponentPresence = {
  key: GovernedPersistenceDashboardComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceDashboardResult = {
  persistenceNavigation: unknown;
  clinicalActivationDashboard: unknown;
  components: GovernedPersistenceDashboardComponentPresence[];
  governance: GovernedPersistenceDashboardGovernance;
  reason: string | null;
};
