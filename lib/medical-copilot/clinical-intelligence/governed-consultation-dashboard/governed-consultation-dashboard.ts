export const GOVERNED_CONSULTATION_DASHBOARD_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationDashboardGovernance = typeof GOVERNED_CONSULTATION_DASHBOARD_GOVERNANCE;

export type GovernedConsultationDashboardComponentKey =
  | "clinicalWorkspaceConsolidation"
  | "consultationRuntime";

export type GovernedConsultationDashboardComponentPresence = {
  key: GovernedConsultationDashboardComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationDashboardResult = {
  clinicalWorkspaceConsolidation: unknown;
  consultationRuntime: unknown;
  components: GovernedConsultationDashboardComponentPresence[];
  governance: GovernedConsultationDashboardGovernance;
  reason: string | null;
};
