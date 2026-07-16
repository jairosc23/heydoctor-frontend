export const GOVERNED_PHYSICIAN_ACTIVATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianActivationWorkspaceGovernance = typeof GOVERNED_PHYSICIAN_ACTIVATION_WORKSPACE_GOVERNANCE;

export type GovernedPhysicianActivationWorkspaceComponentKey =
  | "activationNavigation"
  | "physicianDashboard";

export type GovernedPhysicianActivationWorkspaceComponentPresence = {
  key: GovernedPhysicianActivationWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianActivationWorkspaceResult = {
  activationNavigation: unknown;
  physicianDashboard: unknown;
  components: GovernedPhysicianActivationWorkspaceComponentPresence[];
  governance: GovernedPhysicianActivationWorkspaceGovernance;
  reason: string | null;
};
