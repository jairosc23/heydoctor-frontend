export const GOVERNED_SOAP_PERSISTENCE_EXECUTION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};
export type GovernedSoapPersistenceExecutionGovernance = typeof GOVERNED_SOAP_PERSISTENCE_EXECUTION_GOVERNANCE;
export type GovernedSoapPersistenceExecutionComponentKey =
  | "validation" | "transaction" | "repository" | "execution" | "audit" | "rollback" | "outcome";
export type GovernedSoapPersistenceExecutionComponentPresence = {
  key: GovernedSoapPersistenceExecutionComponentKey; label: string; present: boolean; readOnly: true; persisted: false;
};
export type GovernedSoapPersistenceExecutionResult = {
  runtime: unknown; status: string | null; components: GovernedSoapPersistenceExecutionComponentPresence[];
  governance: GovernedSoapPersistenceExecutionGovernance; reason: string | null; readOnly: true; persisted: false;
  writesEmr: boolean; writeAttempted: boolean; writeExecuted: boolean;
  repositoryInvoked: boolean; rollbackExecuted: boolean; entityPersisted: boolean;
};
