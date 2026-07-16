export const GOVERNED_CONSULTATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationWorkspaceGovernance = typeof GOVERNED_CONSULTATION_WORKSPACE_GOVERNANCE;

export type GovernedConsultationWorkspaceComponentKey =
  | "consultationReview"
  | "clinicalEncounter";

export type GovernedConsultationWorkspaceComponentPresence = {
  key: GovernedConsultationWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationWorkspaceResult = {
  consultationReview: unknown;
  clinicalEncounter: unknown;
  components: GovernedConsultationWorkspaceComponentPresence[];
  governance: GovernedConsultationWorkspaceGovernance;
  reason: string | null;
};
