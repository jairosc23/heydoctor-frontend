export const GOVERNED_CLINICAL_ACTIVATION_RUNTIME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalActivationRuntimeGovernance = typeof GOVERNED_CLINICAL_ACTIVATION_RUNTIME_GOVERNANCE;

export type GovernedClinicalActivationRuntimeComponentKey =
  | "activationSession"
  | "clinicalExperiencePackage";

export type GovernedClinicalActivationRuntimeComponentPresence = {
  key: GovernedClinicalActivationRuntimeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalActivationRuntimeResult = {
  activationSession: unknown;
  clinicalExperiencePackage: unknown;
  components: GovernedClinicalActivationRuntimeComponentPresence[];
  governance: GovernedClinicalActivationRuntimeGovernance;
  reason: string | null;
};
