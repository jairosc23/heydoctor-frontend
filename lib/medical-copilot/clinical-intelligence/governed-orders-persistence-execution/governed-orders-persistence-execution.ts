export const GOVERNED_ORDERS_PERSISTENCE_EXECUTION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};
export type GovernedOrdersPersistenceExecutionGovernance = typeof GOVERNED_ORDERS_PERSISTENCE_EXECUTION_GOVERNANCE;
export type GovernedOrdersPersistenceExecutionComponentKey =
  | "validation" | "transaction" | "repository" | "execution" | "audit" | "rollback" | "outcome";
export type GovernedOrdersPersistenceExecutionComponentPresence = {
  key: GovernedOrdersPersistenceExecutionComponentKey; label: string; present: boolean; readOnly: true; persisted: false;
};
export type GovernedOrdersPersistenceExecutionResult = {
  runtime: unknown; status: string | null; components: GovernedOrdersPersistenceExecutionComponentPresence[];
  governance: GovernedOrdersPersistenceExecutionGovernance; reason: string | null; readOnly: true; persisted: false;
  writesEmr: boolean; writeAttempted: boolean; writeExecuted: boolean;
  repositoryInvoked: boolean; rollbackExecuted: boolean; entityPersisted: boolean;
};
