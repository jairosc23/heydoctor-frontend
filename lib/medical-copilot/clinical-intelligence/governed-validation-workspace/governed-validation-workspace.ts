export const GOVERNED_VALIDATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedValidationWorkspaceGovernance = typeof GOVERNED_VALIDATION_WORKSPACE_GOVERNANCE;

export type GovernedValidationWorkspaceComponentKey =
  | "draftComparison"
  | "reviewSession";

export type GovernedValidationWorkspaceComponentPresence = {
  key: GovernedValidationWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedValidationWorkspaceResult = {
  draftComparison: unknown;
  reviewSession: unknown;
  components: GovernedValidationWorkspaceComponentPresence[];
  governance: GovernedValidationWorkspaceGovernance;
  reason: string | null;
};
