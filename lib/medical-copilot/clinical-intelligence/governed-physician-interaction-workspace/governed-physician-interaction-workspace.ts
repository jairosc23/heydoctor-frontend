export const GOVERNED_PHYSICIAN_INTERACTION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianInteractionWorkspaceGovernance = typeof GOVERNED_PHYSICIAN_INTERACTION_WORKSPACE_GOVERNANCE;

export type GovernedPhysicianInteractionWorkspaceComponentKey =
  | "clinicalExperiencePackage"
  | "physicianDashboard";

export type GovernedPhysicianInteractionWorkspaceComponentPresence = {
  key: GovernedPhysicianInteractionWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianInteractionWorkspaceResult = {
  clinicalExperiencePackage: unknown;
  physicianDashboard: unknown;
  components: GovernedPhysicianInteractionWorkspaceComponentPresence[];
  governance: GovernedPhysicianInteractionWorkspaceGovernance;
  reason: string | null;
};
