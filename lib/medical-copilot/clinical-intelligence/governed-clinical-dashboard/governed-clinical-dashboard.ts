export const GOVERNED_CLINICAL_DASHBOARD_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalDashboardGovernance = typeof GOVERNED_CLINICAL_DASHBOARD_GOVERNANCE;

export type GovernedClinicalDashboardComponentKey =
  | "physicianDashboard"
  | "clinicalEncounter";

export type GovernedClinicalDashboardComponentPresence = {
  key: GovernedClinicalDashboardComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalDashboardResult = {
  physicianDashboard: unknown;
  clinicalEncounter: unknown;
  components: GovernedClinicalDashboardComponentPresence[];
  governance: GovernedClinicalDashboardGovernance;
  reason: string | null;
};
