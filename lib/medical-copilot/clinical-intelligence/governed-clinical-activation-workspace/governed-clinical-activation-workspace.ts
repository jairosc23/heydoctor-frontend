export const GOVERNED_CLINICAL_ACTIVATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalActivationWorkspaceGovernance = typeof GOVERNED_CLINICAL_ACTIVATION_WORKSPACE_GOVERNANCE;

export type GovernedClinicalActivationWorkspaceComponentKey =
  | "physicianRuntimePackage"
  | "clinicalExperiencePackage";

export type GovernedClinicalActivationWorkspaceComponentPresence = {
  key: GovernedClinicalActivationWorkspaceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalActivationWorkspaceResult = {
  physicianRuntimePackage: unknown;
  clinicalExperiencePackage: unknown;
  components: GovernedClinicalActivationWorkspaceComponentPresence[];
  governance: GovernedClinicalActivationWorkspaceGovernance;
  reason: string | null;
};
