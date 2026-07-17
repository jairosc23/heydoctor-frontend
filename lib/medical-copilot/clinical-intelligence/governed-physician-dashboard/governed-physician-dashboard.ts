export const GOVERNED_PHYSICIAN_DASHBOARD_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianDashboardGovernance = typeof GOVERNED_PHYSICIAN_DASHBOARD_GOVERNANCE;

export type GovernedPhysicianDashboardComponentKey =
  | "consultationDashboard"
  | "physicianWorkspace";

export type GovernedPhysicianDashboardComponentPresence = {
  key: GovernedPhysicianDashboardComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianDashboardResult = {
  consultationDashboard: unknown;
  physicianWorkspace: unknown;
  components: GovernedPhysicianDashboardComponentPresence[];
  governance: GovernedPhysicianDashboardGovernance;
  reason: string | null;
};
