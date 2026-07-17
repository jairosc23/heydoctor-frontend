export const GOVERNED_CLINICAL_ACTIVATION_SESSION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedClinicalActivationSessionGovernance = typeof GOVERNED_CLINICAL_ACTIVATION_SESSION_GOVERNANCE;

export type GovernedClinicalActivationSessionComponentKey =
  | "activationDashboard"
  | "reviewSession";

export type GovernedClinicalActivationSessionComponentPresence = {
  key: GovernedClinicalActivationSessionComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedClinicalActivationSessionResult = {
  activationDashboard: unknown;
  reviewSession: unknown;
  components: GovernedClinicalActivationSessionComponentPresence[];
  governance: GovernedClinicalActivationSessionGovernance;
  reason: string | null;
};
