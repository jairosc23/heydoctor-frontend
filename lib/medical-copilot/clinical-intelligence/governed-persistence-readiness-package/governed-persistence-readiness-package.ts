export const GOVERNED_PERSISTENCE_READINESS_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessPackageGovernance = typeof GOVERNED_PERSISTENCE_READINESS_PACKAGE_GOVERNANCE;

export type GovernedPersistenceReadinessPackageComponentKey =
  | "persistenceReadinessConsolidation"
  | "persistencePackage"
  | "clinicalActivationPackage"
  | "physicianRuntimePackage"
  | "clinicalExperiencePackage"
  | "clinicalWorkspacePackage"
  | "documentationPackage"
  | "consultationPackage";

export type GovernedPersistenceReadinessPackageComponentPresence = {
  key: GovernedPersistenceReadinessPackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessPackageResult = {
  persistenceReadinessConsolidation: unknown;
  persistencePackage: unknown;
  clinicalActivationPackage: unknown;
  physicianRuntimePackage: unknown;
  clinicalExperiencePackage: unknown;
  clinicalWorkspacePackage: unknown;
  documentationPackage: unknown;
  consultationPackage: unknown;
  components: GovernedPersistenceReadinessPackageComponentPresence[];
  governance: GovernedPersistenceReadinessPackageGovernance;
  reason: string | null;
};
