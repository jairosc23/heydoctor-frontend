export const GOVERNED_PRESCRIPTION_PERSISTENCE_BRIDGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedPrescriptionPersistenceBridgeGovernance = typeof GOVERNED_PRESCRIPTION_PERSISTENCE_BRIDGE_GOVERNANCE;

export type GovernedPrescriptionPersistenceBridgeComponentKey =
  | "infrastructure"
  | "bridge"
  | "binding"
  | "validation"
  | "preview"
  | "execution"
  | "readiness";

export type GovernedPrescriptionPersistenceBridgeComponentPresence = {
  key: GovernedPrescriptionPersistenceBridgeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedPrescriptionPersistenceBridgeResult = {
  runtime: unknown;
  status: string | null;
  components: GovernedPrescriptionPersistenceBridgeComponentPresence[];
  governance: GovernedPrescriptionPersistenceBridgeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  writeAttempted: false;
  repositoryInvoked: false;
};
