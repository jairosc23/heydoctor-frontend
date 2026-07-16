export const GOVERNED_CLINICAL_ACTIVATION_NAVIGATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalActivationNavigationGovernance = typeof GOVERNED_CLINICAL_ACTIVATION_NAVIGATION_GOVERNANCE;

export type GovernedClinicalActivationNavigationComponentKey =
  | "activationTimeline"
  | "clinicalNavigation";

export type GovernedClinicalActivationNavigationComponentPresence = {
  key: GovernedClinicalActivationNavigationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalActivationNavigationResult = {
  activationTimeline: unknown;
  clinicalNavigation: unknown;
  components: GovernedClinicalActivationNavigationComponentPresence[];
  governance: GovernedClinicalActivationNavigationGovernance;
  reason: string | null;
};
