export const GOVERNED_CLINICAL_WORKSPACE_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalWorkspacePackageGovernance = typeof GOVERNED_CLINICAL_WORKSPACE_PACKAGE_GOVERNANCE;

export type GovernedClinicalWorkspacePackageComponentKey =
  | "clinicalOverview"
  | "clinicalWorkspace"
  | "consultationPackage"
  | "documentationPackage"
  | "clinicalEncounter"
  | "reviewSession"
  | "physicianWorkspace";

export type GovernedClinicalWorkspacePackageComponentPresence = {
  key: GovernedClinicalWorkspacePackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalWorkspacePackageResult = {
  clinicalOverview: unknown;
  clinicalWorkspace: unknown;
  consultationPackage: unknown;
  documentationPackage: unknown;
  clinicalEncounter: unknown;
  reviewSession: unknown;
  physicianWorkspace: unknown;
  components: GovernedClinicalWorkspacePackageComponentPresence[];
  governance: GovernedClinicalWorkspacePackageGovernance;
  reason: string | null;
};
