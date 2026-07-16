export const GOVERNED_DRAFT_COMPARISON_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedDraftComparisonWorkspaceGovernance = typeof GOVERNED_DRAFT_COMPARISON_WORKSPACE_GOVERNANCE;

export type GovernedDraftComparisonWorkspaceComponentKey =
  | "draftReviewWorkspace"
  | "clinicalDocumentationPackage";

export type GovernedDraftComparisonWorkspaceComponentPresence = {
  key: GovernedDraftComparisonWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedDraftComparisonWorkspaceResult = {
  draftReviewWorkspace: unknown;
  clinicalDocumentationPackage: unknown;
  components: GovernedDraftComparisonWorkspaceComponentPresence[];
  governance: GovernedDraftComparisonWorkspaceGovernance;
  reason: string | null;
};
