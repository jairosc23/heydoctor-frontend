export const GOVERNED_PERSISTENCE_REVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReviewGovernance = typeof GOVERNED_PERSISTENCE_REVIEW_GOVERNANCE;

export type GovernedPersistenceReviewComponentKey =
  | "persistencePreparationWorkspace"
  | "clinicalReviewPackage";

export type GovernedPersistenceReviewComponentPresence = {
  key: GovernedPersistenceReviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReviewResult = {
  persistencePreparationWorkspace: unknown;
  clinicalReviewPackage: unknown;
  components: GovernedPersistenceReviewComponentPresence[];
  governance: GovernedPersistenceReviewGovernance;
  reason: string | null;
};
