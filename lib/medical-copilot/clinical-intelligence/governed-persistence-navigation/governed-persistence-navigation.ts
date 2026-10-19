export const GOVERNED_PERSISTENCE_NAVIGATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPersistenceNavigationGovernance = typeof GOVERNED_PERSISTENCE_NAVIGATION_GOVERNANCE;

export type GovernedPersistenceNavigationComponentKey =
  | "persistenceTimeline"
  | "clinicalActivationNavigation";

export type GovernedPersistenceNavigationComponentPresence = {
  key: GovernedPersistenceNavigationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPersistenceNavigationResult = {
  persistenceTimeline: unknown;
  clinicalActivationNavigation: unknown;
  components: GovernedPersistenceNavigationComponentPresence[];
  governance: GovernedPersistenceNavigationGovernance;
  reason: string | null;
};
