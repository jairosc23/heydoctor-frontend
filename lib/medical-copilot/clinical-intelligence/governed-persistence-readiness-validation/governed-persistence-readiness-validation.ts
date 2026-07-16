export const GOVERNED_PERSISTENCE_READINESS_VALIDATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessValidationGovernance = typeof GOVERNED_PERSISTENCE_READINESS_VALIDATION_GOVERNANCE;

export type GovernedPersistenceReadinessValidationComponentKey =
  | "persistenceReadinessPreview"
  | "persistenceValidation";

export type GovernedPersistenceReadinessValidationComponentPresence = {
  key: GovernedPersistenceReadinessValidationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessValidationResult = {
  persistenceReadinessPreview: unknown;
  persistenceValidation: unknown;
  components: GovernedPersistenceReadinessValidationComponentPresence[];
  governance: GovernedPersistenceReadinessValidationGovernance;
  reason: string | null;
};
