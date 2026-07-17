export const GOVERNED_PERSISTENCE_TIMELINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceTimelineGovernance = typeof GOVERNED_PERSISTENCE_TIMELINE_GOVERNANCE;

export type GovernedPersistenceTimelineComponentKey =
  | "persistenceReview"
  | "clinicalActivationTimeline";

export type GovernedPersistenceTimelineComponentPresence = {
  key: GovernedPersistenceTimelineComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceTimelineResult = {
  persistenceReview: unknown;
  clinicalActivationTimeline: unknown;
  components: GovernedPersistenceTimelineComponentPresence[];
  governance: GovernedPersistenceTimelineGovernance;
  reason: string | null;
};
