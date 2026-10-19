export const GOVERNED_CLINICAL_REPOSITORY_RUNTIME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  callsTypeOrm: false as const,
  executesCrud: false as const,
};

export type GovernedClinicalRepositoryRuntimeGovernance = typeof GOVERNED_CLINICAL_REPOSITORY_RUNTIME_GOVERNANCE;

export type GovernedClinicalRepositoryRuntimeComponentKey =
  | "resolver"
  | "capabilities"
  | "readiness"
  | "registry"
  | "adapters"
  | "authorization"
  | "validation"
  | "health";

export type GovernedClinicalRepositoryRuntimeComponentPresence = {
  key: GovernedClinicalRepositoryRuntimeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalRepositoryRuntimeResult = {
  resolver: unknown;
  capabilities: unknown;
  readiness: unknown;
  registry: unknown;
  adapters: unknown;
  authorization: unknown;
  validation: unknown;
  health: unknown;
  components: GovernedClinicalRepositoryRuntimeComponentPresence[];
  governance: GovernedClinicalRepositoryRuntimeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
