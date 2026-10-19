export const GOVERNED_PERSISTENCE_READINESS_TIMELINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceReadinessTimelineGovernance = typeof GOVERNED_PERSISTENCE_READINESS_TIMELINE_GOVERNANCE;

export type GovernedPersistenceReadinessTimelineComponentKey =
  | "persistenceReadinessReview"
  | "persistenceTimeline";

export type GovernedPersistenceReadinessTimelineComponentPresence = {
  key: GovernedPersistenceReadinessTimelineComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceReadinessTimelineResult = {
  persistenceReadinessReview: unknown;
  persistenceTimeline: unknown;
  components: GovernedPersistenceReadinessTimelineComponentPresence[];
  governance: GovernedPersistenceReadinessTimelineGovernance;
  reason: string | null;
};
