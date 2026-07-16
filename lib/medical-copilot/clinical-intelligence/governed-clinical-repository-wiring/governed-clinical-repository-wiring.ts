export const GOVERNED_CLINICAL_REPOSITORY_WIRING_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalRepositoryWiringGovernance = typeof GOVERNED_CLINICAL_REPOSITORY_WIRING_GOVERNANCE;

export type GovernedClinicalRepositoryWiringComponentKey =
  | "wiring"
  | "descriptorRegistry"
  | "dependencyGraph"
  | "resolutionContext"
  | "bindingContracts";

export type GovernedClinicalRepositoryWiringComponentPresence = {
  key: GovernedClinicalRepositoryWiringComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalRepositoryWiringResult = {
  wiring: unknown;
  descriptorRegistry: unknown;
  dependencyGraph: unknown;
  resolutionContext: unknown;
  bindingContracts: unknown;
  components: GovernedClinicalRepositoryWiringComponentPresence[];
  governance: GovernedClinicalRepositoryWiringGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
