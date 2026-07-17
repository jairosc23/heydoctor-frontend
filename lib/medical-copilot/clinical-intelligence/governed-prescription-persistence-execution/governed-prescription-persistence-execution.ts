export const GOVERNED_PRESCRIPTION_PERSISTENCE_EXECUTION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};
export type GovernedPrescriptionPersistenceExecutionGovernance = typeof GOVERNED_PRESCRIPTION_PERSISTENCE_EXECUTION_GOVERNANCE;
export type GovernedPrescriptionPersistenceExecutionComponentKey =
  | "validation" | "transaction" | "repository" | "execution" | "audit" | "rollback" | "outcome";
export type GovernedPrescriptionPersistenceExecutionComponentPresence = {
  key: GovernedPrescriptionPersistenceExecutionComponentKey; label: string; present: boolean; readOnly: true; persisted: false;
};
export type GovernedPrescriptionPersistenceExecutionResult = {
  runtime: unknown; status: string | null; components: GovernedPrescriptionPersistenceExecutionComponentPresence[];
  governance: GovernedPrescriptionPersistenceExecutionGovernance; reason: string | null; readOnly: true; persisted: false;
  writesEmr: boolean; writeAttempted: boolean; writeExecuted: boolean;
  repositoryInvoked: boolean; rollbackExecuted: boolean; entityPersisted: boolean;
};
