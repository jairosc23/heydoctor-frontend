export const GOVERNED_CLINICAL_PERSISTENCE_ORCHESTRATOR_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalPersistenceOrchestratorGovernance = typeof GOVERNED_CLINICAL_PERSISTENCE_ORCHESTRATOR_GOVERNANCE;

export type GovernedClinicalPersistenceOrchestratorComponentKey =
  | "orchestrator"
  | "context"
  | "state"
  | "referencedSurfaces";

export type GovernedClinicalPersistenceOrchestratorComponentPresence = {
  key: GovernedClinicalPersistenceOrchestratorComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalPersistenceOrchestratorResult = {
  orchestrationRuntime: unknown;
  components: GovernedClinicalPersistenceOrchestratorComponentPresence[];
  governance: GovernedClinicalPersistenceOrchestratorGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
