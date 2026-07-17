export const GOVERNED_CLINICAL_EXPERIENCE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalExperienceGovernance = typeof GOVERNED_CLINICAL_EXPERIENCE_GOVERNANCE;

export type GovernedClinicalExperienceComponentKey =
  | "clinicalNavigation"
  | "clinicalSessionDashboard";

export type GovernedClinicalExperienceComponentPresence = {
  key: GovernedClinicalExperienceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalExperienceResult = {
  clinicalNavigation: unknown;
  clinicalSessionDashboard: unknown;
  components: GovernedClinicalExperienceComponentPresence[];
  governance: GovernedClinicalExperienceGovernance;
  reason: string | null;
};
