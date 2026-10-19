export const GOVERNED_CLINICAL_ACTIVATION_REVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalActivationReviewGovernance = typeof GOVERNED_CLINICAL_ACTIVATION_REVIEW_GOVERNANCE;

export type GovernedClinicalActivationReviewComponentKey =
  | "activationWorkspace"
  | "clinicalReviewPackage";

export type GovernedClinicalActivationReviewComponentPresence = {
  key: GovernedClinicalActivationReviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalActivationReviewResult = {
  activationWorkspace: unknown;
  clinicalReviewPackage: unknown;
  components: GovernedClinicalActivationReviewComponentPresence[];
  governance: GovernedClinicalActivationReviewGovernance;
  reason: string | null;
};
