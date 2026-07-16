export const GOVERNED_CLINICAL_NAVIGATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalNavigationGovernance = typeof GOVERNED_CLINICAL_NAVIGATION_GOVERNANCE;

export type GovernedClinicalNavigationComponentKey =
  | "encounterTimeline"
  | "clinicalWorkspace";

export type GovernedClinicalNavigationComponentPresence = {
  key: GovernedClinicalNavigationComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalNavigationResult = {
  encounterTimeline: unknown;
  clinicalWorkspace: unknown;
  components: GovernedClinicalNavigationComponentPresence[];
  governance: GovernedClinicalNavigationGovernance;
  reason: string | null;
};
