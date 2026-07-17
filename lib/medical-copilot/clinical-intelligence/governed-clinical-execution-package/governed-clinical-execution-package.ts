export const GOVERNED_CLINICAL_EXECUTION_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalExecutionPackageGovernance = typeof GOVERNED_CLINICAL_EXECUTION_PACKAGE_GOVERNANCE;

export type GovernedClinicalExecutionPackageComponentKey =
  | "executionPlanner"
  | "writePlanner"
  | "rollbackPlanner"
  | "transactionPlanner"
  | "strategy"
  | "context"
  | "readiness"
  | "preview";

export type GovernedClinicalExecutionPackageComponentPresence = {
  key: GovernedClinicalExecutionPackageComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalExecutionPackageResult = {
  executionRuntime: unknown;
  components: GovernedClinicalExecutionPackageComponentPresence[];
  governance: GovernedClinicalExecutionPackageGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
