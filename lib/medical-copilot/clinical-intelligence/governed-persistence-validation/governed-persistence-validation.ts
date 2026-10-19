export const GOVERNED_PERSISTENCE_VALIDATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceValidationGovernance = typeof GOVERNED_PERSISTENCE_VALIDATION_GOVERNANCE;

export type GovernedPersistenceValidationComponentKey =
  | "persistencePreview"
  | "physicianRuntimePackage";

export type GovernedPersistenceValidationComponentPresence = {
  key: GovernedPersistenceValidationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceValidationResult = {
  persistencePreview: unknown;
  physicianRuntimePackage: unknown;
  components: GovernedPersistenceValidationComponentPresence[];
  governance: GovernedPersistenceValidationGovernance;
  reason: string | null;
};
