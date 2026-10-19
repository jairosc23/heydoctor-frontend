export const GOVERNED_CONSULTATION_HOME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationHomeGovernance = typeof GOVERNED_CONSULTATION_HOME_GOVERNANCE;

export type GovernedConsultationHomeComponentKey =
  | "consultationDashboard"
  | "physicianHome";

export type GovernedConsultationHomeComponentPresence = {
  key: GovernedConsultationHomeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationHomeResult = {
  consultationDashboard: unknown;
  physicianHome: unknown;
  components: GovernedConsultationHomeComponentPresence[];
  governance: GovernedConsultationHomeGovernance;
  reason: string | null;
};
