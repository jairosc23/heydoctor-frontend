export const GOVERNED_ENCOUNTER_TIMELINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedEncounterTimelineGovernance = typeof GOVERNED_ENCOUNTER_TIMELINE_GOVERNANCE;

export type GovernedEncounterTimelineComponentKey =
  | "clinicalTimeline"
  | "encounterSnapshot";

export type GovernedEncounterTimelineComponentPresence = {
  key: GovernedEncounterTimelineComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedEncounterTimelineResult = {
  clinicalTimeline: unknown;
  encounterSnapshot: unknown;
  components: GovernedEncounterTimelineComponentPresence[];
  governance: GovernedEncounterTimelineGovernance;
  reason: string | null;
};
