export const GOVERNED_PERSISTENCE_READINESS_PREVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessPreviewGovernance = typeof GOVERNED_PERSISTENCE_READINESS_PREVIEW_GOVERNANCE;

export type GovernedPersistenceReadinessPreviewComponentKey =
  | "persistenceReadinessRuntime"
  | "persistencePreview";

export type GovernedPersistenceReadinessPreviewComponentPresence = {
  key: GovernedPersistenceReadinessPreviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessPreviewResult = {
  persistenceReadinessRuntime: unknown;
  persistencePreview: unknown;
  components: GovernedPersistenceReadinessPreviewComponentPresence[];
  governance: GovernedPersistenceReadinessPreviewGovernance;
  reason: string | null;
};
