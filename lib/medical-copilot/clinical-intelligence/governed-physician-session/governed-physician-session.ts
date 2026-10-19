export const GOVERNED_PHYSICIAN_SESSION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedPhysicianSessionGovernance = typeof GOVERNED_PHYSICIAN_SESSION_GOVERNANCE;

export type GovernedPhysicianSessionComponentKey =
  | "clinicalReviewPackage"
  | "physicianDashboard";

export type GovernedPhysicianSessionComponentPresence = {
  key: GovernedPhysicianSessionComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedPhysicianSessionResult = {
  clinicalReviewPackage: unknown;
  physicianDashboard: unknown;
  components: GovernedPhysicianSessionComponentPresence[];
  governance: GovernedPhysicianSessionGovernance;
  reason: string | null;
};
