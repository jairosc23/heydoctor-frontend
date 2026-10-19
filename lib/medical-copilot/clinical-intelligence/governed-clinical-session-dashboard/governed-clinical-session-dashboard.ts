export const GOVERNED_CLINICAL_SESSION_DASHBOARD_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalSessionDashboardGovernance = typeof GOVERNED_CLINICAL_SESSION_DASHBOARD_GOVERNANCE;

export type GovernedClinicalSessionDashboardComponentKey =
  | "clinicalDashboard"
  | "reviewSession"
  | "consultationPackage";

export type GovernedClinicalSessionDashboardComponentPresence = {
  key: GovernedClinicalSessionDashboardComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalSessionDashboardResult = {
  clinicalDashboard: unknown;
  reviewSession: unknown;
  consultationPackage: unknown;
  components: GovernedClinicalSessionDashboardComponentPresence[];
  governance: GovernedClinicalSessionDashboardGovernance;
  reason: string | null;
};
