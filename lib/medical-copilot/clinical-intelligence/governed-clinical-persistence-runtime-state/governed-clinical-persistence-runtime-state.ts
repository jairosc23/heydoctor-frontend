export const GOVERNED_CLINICAL_PERSISTENCE_RUNTIME_STATE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  executesWrite: false as const,
};

export type GovernedClinicalPersistenceRuntimeStateGovernance = typeof GOVERNED_CLINICAL_PERSISTENCE_RUNTIME_STATE_GOVERNANCE;

export type GovernedClinicalPersistenceRuntimeStateComponentKey =
  | "intent"
  | "transaction"
  | "authorization"
  | "validation"
  | "lifecycle"
  | "audit"
  | "rollback"
  | "outcome";

export type GovernedClinicalPersistenceRuntimeStateComponentPresence = {
  key: GovernedClinicalPersistenceRuntimeStateComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalPersistenceRuntimeStateResult = {
  intent: unknown;
  transaction: unknown;
  authorization: unknown;
  validation: unknown;
  lifecycle: unknown;
  audit: unknown;
  rollback: unknown;
  outcome: unknown;
  health: unknown;
  repositoryRegistry: unknown;
  components: GovernedClinicalPersistenceRuntimeStateComponentPresence[];
  governance: GovernedClinicalPersistenceRuntimeStateGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
