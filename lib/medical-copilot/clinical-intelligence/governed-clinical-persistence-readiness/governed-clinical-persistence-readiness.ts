export const GOVERNED_CLINICAL_PERSISTENCE_READINESS_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalPersistenceReadinessGovernance = typeof GOVERNED_CLINICAL_PERSISTENCE_READINESS_GOVERNANCE;

export type GovernedClinicalPersistenceReadinessComponentKey =
  | "evaluation"
  | "capabilitySummary"
  | "blockingConditions"
  | "governanceCheck";

export type GovernedClinicalPersistenceReadinessComponentPresence = {
  key: GovernedClinicalPersistenceReadinessComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalPersistenceReadinessResult = {
  readinessRuntime: unknown;
  components: GovernedClinicalPersistenceReadinessComponentPresence[];
  governance: GovernedClinicalPersistenceReadinessGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
};
