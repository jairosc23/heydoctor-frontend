export const GOVERNED_CLINICAL_EXPERIENCE_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalExperiencePackageGovernance = typeof GOVERNED_CLINICAL_EXPERIENCE_PACKAGE_GOVERNANCE;

export type GovernedClinicalExperiencePackageComponentKey =
  | "consultationExperience"
  | "clinicalWorkspacePackage"
  | "consultationPackage"
  | "clinicalEncounter"
  | "clinicalDashboard"
  | "physicianDashboard"
  | "reviewSession";

export type GovernedClinicalExperiencePackageComponentPresence = {
  key: GovernedClinicalExperiencePackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalExperiencePackageResult = {
  consultationExperience: unknown;
  clinicalWorkspacePackage: unknown;
  consultationPackage: unknown;
  clinicalEncounter: unknown;
  clinicalDashboard: unknown;
  physicianDashboard: unknown;
  reviewSession: unknown;
  components: GovernedClinicalExperiencePackageComponentPresence[];
  governance: GovernedClinicalExperiencePackageGovernance;
  reason: string | null;
};
