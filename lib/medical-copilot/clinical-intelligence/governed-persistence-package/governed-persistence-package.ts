export const GOVERNED_PERSISTENCE_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistencePackageGovernance = typeof GOVERNED_PERSISTENCE_PACKAGE_GOVERNANCE;

export type GovernedPersistencePackageComponentKey =
  | "persistenceValidation"
  | "clinicalActivationPackage"
  | "physicianRuntimePackage"
  | "clinicalExperiencePackage"
  | "clinicalWorkspacePackage"
  | "documentationPackage"
  | "consultationPackage";

export type GovernedPersistencePackageComponentPresence = {
  key: GovernedPersistencePackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistencePackageResult = {
  persistenceValidation: unknown;
  clinicalActivationPackage: unknown;
  physicianRuntimePackage: unknown;
  clinicalExperiencePackage: unknown;
  clinicalWorkspacePackage: unknown;
  documentationPackage: unknown;
  consultationPackage: unknown;
  components: GovernedPersistencePackageComponentPresence[];
  governance: GovernedPersistencePackageGovernance;
  reason: string | null;
};
