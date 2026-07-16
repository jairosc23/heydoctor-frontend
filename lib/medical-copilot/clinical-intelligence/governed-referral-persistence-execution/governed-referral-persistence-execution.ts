export const GOVERNED_REFERRAL_PERSISTENCE_EXECUTION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};
export type GovernedReferralPersistenceExecutionGovernance = typeof GOVERNED_REFERRAL_PERSISTENCE_EXECUTION_GOVERNANCE;
export type GovernedReferralPersistenceExecutionComponentKey =
  | "validation" | "transaction" | "repository" | "execution" | "audit" | "rollback" | "outcome";
export type GovernedReferralPersistenceExecutionComponentPresence = {
  key: GovernedReferralPersistenceExecutionComponentKey; label: string; present: boolean; readOnly: true; persisted: false;
};
export type GovernedReferralPersistenceExecutionResult = {
  runtime: unknown; status: string | null; components: GovernedReferralPersistenceExecutionComponentPresence[];
  governance: GovernedReferralPersistenceExecutionGovernance; reason: string | null; readOnly: true; persisted: false;
  writesEmr: boolean; writeAttempted: boolean; writeExecuted: boolean;
  repositoryInvoked: boolean; rollbackExecuted: boolean; entityPersisted: boolean;
};
