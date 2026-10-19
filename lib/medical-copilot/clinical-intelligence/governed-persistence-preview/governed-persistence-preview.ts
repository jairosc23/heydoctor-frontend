export const GOVERNED_PERSISTENCE_PREVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistencePreviewGovernance = typeof GOVERNED_PERSISTENCE_PREVIEW_GOVERNANCE;

export type GovernedPersistencePreviewComponentKey =
  | "persistenceRuntime"
  | "clinicalActivationPackage";

export type GovernedPersistencePreviewComponentPresence = {
  key: GovernedPersistencePreviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistencePreviewResult = {
  persistenceRuntime: unknown;
  clinicalActivationPackage: unknown;
  components: GovernedPersistencePreviewComponentPresence[];
  governance: GovernedPersistencePreviewGovernance;
  reason: string | null;
};
