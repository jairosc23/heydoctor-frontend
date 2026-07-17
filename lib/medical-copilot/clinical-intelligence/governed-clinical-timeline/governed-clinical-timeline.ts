export const GOVERNED_CLINICAL_TIMELINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalTimelineGovernance = typeof GOVERNED_CLINICAL_TIMELINE_GOVERNANCE;

export type GovernedClinicalTimelineComponentKey =
  | "consultationHome"
  | "clinicalOverview";

export type GovernedClinicalTimelineComponentPresence = {
  key: GovernedClinicalTimelineComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalTimelineResult = {
  consultationHome: unknown;
  clinicalOverview: unknown;
  components: GovernedClinicalTimelineComponentPresence[];
  governance: GovernedClinicalTimelineGovernance;
  reason: string | null;
};
