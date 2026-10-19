export const GOVERNED_CLINICAL_WORKSPACE_REVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalWorkspaceReviewGovernance = typeof GOVERNED_CLINICAL_WORKSPACE_REVIEW_GOVERNANCE;

export type GovernedClinicalWorkspaceReviewComponentKey =
  | "clinicalWorkspace"
  | "reviewSession"
  | "physicianWorkspace";

export type GovernedClinicalWorkspaceReviewComponentPresence = {
  key: GovernedClinicalWorkspaceReviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalWorkspaceReviewResult = {
  clinicalWorkspace: unknown;
  reviewSession: unknown;
  physicianWorkspace: unknown;
  components: GovernedClinicalWorkspaceReviewComponentPresence[];
  governance: GovernedClinicalWorkspaceReviewGovernance;
  reason: string | null;
};
