export const GOVERNED_PHYSICIAN_RUNTIME_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianRuntimePackageGovernance = typeof GOVERNED_PHYSICIAN_RUNTIME_PACKAGE_GOVERNANCE;

export type GovernedPhysicianRuntimePackageComponentKey =
  | "physicianSession"
  | "clinicalExperiencePackage"
  | "clinicalWorkspacePackage"
  | "documentationPackage"
  | "consultationPackage"
  | "reviewSession";

export type GovernedPhysicianRuntimePackageComponentPresence = {
  key: GovernedPhysicianRuntimePackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianRuntimePackageResult = {
  physicianSession: unknown;
  clinicalExperiencePackage: unknown;
  clinicalWorkspacePackage: unknown;
  documentationPackage: unknown;
  consultationPackage: unknown;
  reviewSession: unknown;
  components: GovernedPhysicianRuntimePackageComponentPresence[];
  governance: GovernedPhysicianRuntimePackageGovernance;
  reason: string | null;
};
