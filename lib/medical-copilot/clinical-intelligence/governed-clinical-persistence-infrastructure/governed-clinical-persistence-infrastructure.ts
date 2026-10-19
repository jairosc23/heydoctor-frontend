export const GOVERNED_CLINICAL_PERSISTENCE_INFRASTRUCTURE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  callsDomainCrud: false as const,
};

export type GovernedClinicalPersistenceInfrastructureGovernance =
  typeof GOVERNED_CLINICAL_PERSISTENCE_INFRASTRUCTURE_GOVERNANCE;

export type GovernedClinicalPersistenceInfrastructureComponentKey =
  | "intent"
  | "approvalGate"
  | "policy"
  | "auditContract"
  | "correlation"
  | "idempotency"
  | "domainAdapters"
  | "outcome";

export type GovernedClinicalPersistenceInfrastructureComponentPresence = {
  key: GovernedClinicalPersistenceInfrastructureComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalPersistenceInfrastructureResult = {
  intent: unknown;
  approvalGate: unknown;
  policy: unknown;
  auditContract: unknown;
  correlation: unknown;
  idempotency: unknown;
  domainAdapters: unknown;
  outcome: unknown;
  components: GovernedClinicalPersistenceInfrastructureComponentPresence[];
  governance: GovernedClinicalPersistenceInfrastructureGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
