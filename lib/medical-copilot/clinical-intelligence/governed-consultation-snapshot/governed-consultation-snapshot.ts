export const GOVERNED_CONSULTATION_SNAPSHOT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedConsultationSnapshotGovernance = typeof GOVERNED_CONSULTATION_SNAPSHOT_GOVERNANCE;

export type GovernedConsultationSnapshotComponentKey =
  | "consultationRuntime"
  | "clinicalContext"
  | "clinicalPlan"
  | "reviewSession";

export type GovernedConsultationSnapshotComponentPresence = {
  key: GovernedConsultationSnapshotComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

/** Composite governed surface — presence of certified components only. */
export type GovernedConsultationSnapshotResult = {
  consultationRuntime: unknown;
  clinicalContext: unknown;
  clinicalPlan: unknown;
  reviewSession: unknown;
  components: GovernedConsultationSnapshotComponentPresence[];
  governance: GovernedConsultationSnapshotGovernance;
  reason: string | null;
};
