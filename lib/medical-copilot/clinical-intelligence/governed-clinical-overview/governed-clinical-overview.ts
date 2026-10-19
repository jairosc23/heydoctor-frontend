export const GOVERNED_CLINICAL_OVERVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalOverviewGovernance = typeof GOVERNED_CLINICAL_OVERVIEW_GOVERNANCE;

export type GovernedClinicalOverviewComponentKey =
  | "clinicalSessionDashboard"
  | "documentationPackage";

export type GovernedClinicalOverviewComponentPresence = {
  key: GovernedClinicalOverviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalOverviewResult = {
  clinicalSessionDashboard: unknown;
  documentationPackage: unknown;
  components: GovernedClinicalOverviewComponentPresence[];
  governance: GovernedClinicalOverviewGovernance;
  reason: string | null;
};
