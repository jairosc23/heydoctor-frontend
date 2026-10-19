export const GOVERNED_CLINICAL_REVIEW_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalReviewPackageGovernance = typeof GOVERNED_CLINICAL_REVIEW_PACKAGE_GOVERNANCE;

export type GovernedClinicalReviewPackageComponentKey =
  | "pendingActions"
  | "reviewSession"
  | "consultationExperience";

export type GovernedClinicalReviewPackageComponentPresence = {
  key: GovernedClinicalReviewPackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalReviewPackageResult = {
  pendingActions: unknown;
  reviewSession: unknown;
  consultationExperience: unknown;
  components: GovernedClinicalReviewPackageComponentPresence[];
  governance: GovernedClinicalReviewPackageGovernance;
  reason: string | null;
};
