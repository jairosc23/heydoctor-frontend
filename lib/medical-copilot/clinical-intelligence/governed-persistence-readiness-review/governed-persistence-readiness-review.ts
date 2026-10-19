export const GOVERNED_PERSISTENCE_READINESS_REVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessReviewGovernance = typeof GOVERNED_PERSISTENCE_READINESS_REVIEW_GOVERNANCE;

export type GovernedPersistenceReadinessReviewComponentKey =
  | "persistenceReadinessWorkspace"
  | "clinicalReviewPackage";

export type GovernedPersistenceReadinessReviewComponentPresence = {
  key: GovernedPersistenceReadinessReviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessReviewResult = {
  persistenceReadinessWorkspace: unknown;
  clinicalReviewPackage: unknown;
  components: GovernedPersistenceReadinessReviewComponentPresence[];
  governance: GovernedPersistenceReadinessReviewGovernance;
  reason: string | null;
};
