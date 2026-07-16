export const GOVERNED_SOAP_PERSISTENCE_BRIDGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedSoapPersistenceBridgeGovernance = typeof GOVERNED_SOAP_PERSISTENCE_BRIDGE_GOVERNANCE;

export type GovernedSoapPersistenceBridgeComponentKey =
  | "infrastructure"
  | "bridge"
  | "binding"
  | "validation"
  | "preview"
  | "execution"
  | "readiness";

export type GovernedSoapPersistenceBridgeComponentPresence = {
  key: GovernedSoapPersistenceBridgeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedSoapPersistenceBridgeResult = {
  runtime: unknown;
  status: string | null;
  components: GovernedSoapPersistenceBridgeComponentPresence[];
  governance: GovernedSoapPersistenceBridgeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  writeAttempted: false;
  repositoryInvoked: false;
};
