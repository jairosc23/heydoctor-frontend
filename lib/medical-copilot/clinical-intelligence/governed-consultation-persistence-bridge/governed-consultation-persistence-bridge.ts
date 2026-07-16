export const GOVERNED_CONSULTATION_PERSISTENCE_BRIDGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedConsultationPersistenceBridgeGovernance = typeof GOVERNED_CONSULTATION_PERSISTENCE_BRIDGE_GOVERNANCE;

export type GovernedConsultationPersistenceBridgeComponentKey =
  | "infrastructure"
  | "bridge"
  | "binding"
  | "validation"
  | "preview"
  | "execution"
  | "readiness";

export type GovernedConsultationPersistenceBridgeComponentPresence = {
  key: GovernedConsultationPersistenceBridgeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedConsultationPersistenceBridgeResult = {
  runtime: unknown;
  status: string | null;
  components: GovernedConsultationPersistenceBridgeComponentPresence[];
  governance: GovernedConsultationPersistenceBridgeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  writeAttempted: false;
  repositoryInvoked: false;
};
