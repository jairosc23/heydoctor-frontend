export const GOVERNED_CLINICAL_HOME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalHomeGovernance = typeof GOVERNED_CLINICAL_HOME_GOVERNANCE;

export type GovernedClinicalHomeComponentKey =
  | "clinicalWorkspacePackage"
  | "clinicalDashboard";

export type GovernedClinicalHomeComponentPresence = {
  key: GovernedClinicalHomeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalHomeResult = {
  clinicalWorkspacePackage: unknown;
  clinicalDashboard: unknown;
  components: GovernedClinicalHomeComponentPresence[];
  governance: GovernedClinicalHomeGovernance;
  reason: string | null;
};
