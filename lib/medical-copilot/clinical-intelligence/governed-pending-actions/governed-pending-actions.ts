export const GOVERNED_PENDING_ACTIONS_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPendingActionsGovernance = typeof GOVERNED_PENDING_ACTIONS_GOVERNANCE;

export type GovernedPendingActionsComponentKey =
  | "approvalQueue"
  | "clinicalWorkspacePackage";

export type GovernedPendingActionsComponentPresence = {
  key: GovernedPendingActionsComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPendingActionsResult = {
  approvalQueue: unknown;
  clinicalWorkspacePackage: unknown;
  components: GovernedPendingActionsComponentPresence[];
  governance: GovernedPendingActionsGovernance;
  reason: string | null;
};
