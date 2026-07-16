export const GOVERNED_CLINICAL_VALIDATION_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalValidationPackageGovernance = typeof GOVERNED_CLINICAL_VALIDATION_PACKAGE_GOVERNANCE;

export type GovernedClinicalValidationPackageComponentKey =
  | "ownershipValidator"
  | "tenantValidator"
  | "clinicValidator"
  | "sessionValidator"
  | "versionValidator"
  | "entityValidator"
  | "draftValidator"
  | "approvalValidator";

export type GovernedClinicalValidationPackageComponentPresence = {
  key: GovernedClinicalValidationPackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalValidationPackageResult = {
  ownershipValidator: unknown;
  tenantValidator: unknown;
  clinicValidator: unknown;
  sessionValidator: unknown;
  versionValidator: unknown;
  entityValidator: unknown;
  draftValidator: unknown;
  approvalValidator: unknown;
  components: GovernedClinicalValidationPackageComponentPresence[];
  governance: GovernedClinicalValidationPackageGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
