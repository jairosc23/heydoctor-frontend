export const GOVERNED_CLINICAL_DOCUMENTS_PERSISTENCE_EXECUTION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};
export type GovernedClinicalDocumentsPersistenceExecutionGovernance = typeof GOVERNED_CLINICAL_DOCUMENTS_PERSISTENCE_EXECUTION_GOVERNANCE;
export type GovernedClinicalDocumentsPersistenceExecutionComponentKey =
  | "validation" | "transaction" | "repository" | "execution" | "audit" | "rollback" | "outcome";
export type GovernedClinicalDocumentsPersistenceExecutionComponentPresence = {
  key: GovernedClinicalDocumentsPersistenceExecutionComponentKey; label: string; present: boolean; readOnly: true; persisted: false;
};
export type GovernedClinicalDocumentsPersistenceExecutionResult = {
  runtime: unknown; status: string | null; components: GovernedClinicalDocumentsPersistenceExecutionComponentPresence[];
  governance: GovernedClinicalDocumentsPersistenceExecutionGovernance; reason: string | null; readOnly: true; persisted: false;
  writesEmr: boolean; writeAttempted: boolean; writeExecuted: boolean;
  repositoryInvoked: boolean; rollbackExecuted: boolean; entityPersisted: boolean;
};
