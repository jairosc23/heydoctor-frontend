export const GOVERNED_ENCOUNTER_REVIEW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedEncounterReviewGovernance = typeof GOVERNED_ENCOUNTER_REVIEW_GOVERNANCE;

export type GovernedEncounterReviewComponentKey =
  | "encounterWorkspace"
  | "reviewSession";

export type GovernedEncounterReviewComponentPresence = {
  key: GovernedEncounterReviewComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedEncounterReviewResult = {
  encounterWorkspace: unknown;
  reviewSession: unknown;
  components: GovernedEncounterReviewComponentPresence[];
  governance: GovernedEncounterReviewGovernance;
  reason: string | null;
};
