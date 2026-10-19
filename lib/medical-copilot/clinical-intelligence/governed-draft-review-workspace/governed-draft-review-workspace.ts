export const GOVERNED_DRAFT_REVIEW_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedDraftReviewWorkspaceGovernance = typeof GOVERNED_DRAFT_REVIEW_WORKSPACE_GOVERNANCE;

export type GovernedDraftReviewWorkspaceComponentKey =
  | "documentationPackage"
  | "physicianInteractionWorkspace";

export type GovernedDraftReviewWorkspaceComponentPresence = {
  key: GovernedDraftReviewWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedDraftReviewWorkspaceResult = {
  documentationPackage: unknown;
  physicianInteractionWorkspace: unknown;
  components: GovernedDraftReviewWorkspaceComponentPresence[];
  governance: GovernedDraftReviewWorkspaceGovernance;
  reason: string | null;
};
