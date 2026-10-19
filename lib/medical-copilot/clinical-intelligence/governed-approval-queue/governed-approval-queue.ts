export const GOVERNED_APPROVAL_QUEUE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedApprovalQueueGovernance = typeof GOVERNED_APPROVAL_QUEUE_GOVERNANCE;

export type GovernedApprovalQueueComponentKey =
  | "approvalPreview"
  | "consultationPackage";

export type GovernedApprovalQueueComponentPresence = {
  key: GovernedApprovalQueueComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedApprovalQueueResult = {
  approvalPreview: unknown;
  consultationPackage: unknown;
  components: GovernedApprovalQueueComponentPresence[];
  governance: GovernedApprovalQueueGovernance;
  reason: string | null;
};
