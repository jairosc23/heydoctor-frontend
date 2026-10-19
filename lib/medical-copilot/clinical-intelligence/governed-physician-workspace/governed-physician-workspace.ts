export const GOVERNED_PHYSICIAN_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianWorkspaceGovernance = typeof GOVERNED_PHYSICIAN_WORKSPACE_GOVERNANCE;

export type GovernedPhysicianWorkspaceComponentKey =
  | "clinicalEncounter"
  | "physicianDecisionWorkspace"
  | "reviewSession"
  | "clinicalContext"
  | "clinicalPlan";

export type GovernedPhysicianWorkspaceComponentPresence = {
  key: GovernedPhysicianWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianWorkspaceResult = {
  clinicalEncounter: unknown;
  physicianDecisionWorkspace: unknown;
  reviewSession: unknown;
  clinicalContext: unknown;
  clinicalPlan: unknown;
  components: GovernedPhysicianWorkspaceComponentPresence[];
  governance: GovernedPhysicianWorkspaceGovernance;
  reason: string | null;
};
