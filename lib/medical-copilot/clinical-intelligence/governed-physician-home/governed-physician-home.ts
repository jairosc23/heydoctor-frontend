export const GOVERNED_PHYSICIAN_HOME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianHomeGovernance = typeof GOVERNED_PHYSICIAN_HOME_GOVERNANCE;

export type GovernedPhysicianHomeComponentKey =
  | "physicianDashboard"
  | "clinicalHome";

export type GovernedPhysicianHomeComponentPresence = {
  key: GovernedPhysicianHomeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianHomeResult = {
  physicianDashboard: unknown;
  clinicalHome: unknown;
  components: GovernedPhysicianHomeComponentPresence[];
  governance: GovernedPhysicianHomeGovernance;
  reason: string | null;
};
