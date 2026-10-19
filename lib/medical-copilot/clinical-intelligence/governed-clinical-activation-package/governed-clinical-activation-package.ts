export const GOVERNED_CLINICAL_ACTIVATION_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalActivationPackageGovernance = typeof GOVERNED_CLINICAL_ACTIVATION_PACKAGE_GOVERNANCE;

export type GovernedClinicalActivationPackageComponentKey =
  | "clinicalActivationRuntime"
  | "physicianRuntimePackage"
  | "clinicalExperiencePackage"
  | "clinicalWorkspacePackage"
  | "consultationPackage"
  | "documentationPackage"
  | "reviewSession";

export type GovernedClinicalActivationPackageComponentPresence = {
  key: GovernedClinicalActivationPackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalActivationPackageResult = {
  clinicalActivationRuntime: unknown;
  physicianRuntimePackage: unknown;
  clinicalExperiencePackage: unknown;
  clinicalWorkspacePackage: unknown;
  consultationPackage: unknown;
  documentationPackage: unknown;
  reviewSession: unknown;
  components: GovernedClinicalActivationPackageComponentPresence[];
  governance: GovernedClinicalActivationPackageGovernance;
  reason: string | null;
};
