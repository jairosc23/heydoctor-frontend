export const GOVERNED_APPROVAL_PREVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedApprovalPreviewGovernance = typeof GOVERNED_APPROVAL_PREVIEW_GOVERNANCE;

export type GovernedApprovalPreviewComponentKey =
  | "validationWorkspace"
  | "physicianWorkspace";

export type GovernedApprovalPreviewComponentPresence = {
  key: GovernedApprovalPreviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedApprovalPreviewResult = {
  validationWorkspace: unknown;
  physicianWorkspace: unknown;
  components: GovernedApprovalPreviewComponentPresence[];
  governance: GovernedApprovalPreviewGovernance;
  reason: string | null;
};
