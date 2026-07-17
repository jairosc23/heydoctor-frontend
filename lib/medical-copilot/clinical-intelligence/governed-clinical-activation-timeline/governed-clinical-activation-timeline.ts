export const GOVERNED_CLINICAL_ACTIVATION_TIMELINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalActivationTimelineGovernance = typeof GOVERNED_CLINICAL_ACTIVATION_TIMELINE_GOVERNANCE;

export type GovernedClinicalActivationTimelineComponentKey =
  | "activationReview"
  | "clinicalTimeline";

export type GovernedClinicalActivationTimelineComponentPresence = {
  key: GovernedClinicalActivationTimelineComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalActivationTimelineResult = {
  activationReview: unknown;
  clinicalTimeline: unknown;
  components: GovernedClinicalActivationTimelineComponentPresence[];
  governance: GovernedClinicalActivationTimelineGovernance;
  reason: string | null;
};
