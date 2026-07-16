export const GOVERNED_CONSULTATION_ACTIVATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationActivationWorkspaceGovernance = typeof GOVERNED_CONSULTATION_ACTIVATION_WORKSPACE_GOVERNANCE;

export type GovernedConsultationActivationWorkspaceComponentKey =
  | "physicianActivationWorkspace"
  | "consultationPackage";

export type GovernedConsultationActivationWorkspaceComponentPresence = {
  key: GovernedConsultationActivationWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationActivationWorkspaceResult = {
  physicianActivationWorkspace: unknown;
  consultationPackage: unknown;
  components: GovernedConsultationActivationWorkspaceComponentPresence[];
  governance: GovernedConsultationActivationWorkspaceGovernance;
  reason: string | null;
};
