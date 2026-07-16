export const GOVERNED_CLINICAL_DOCUMENTS_PERSISTENCE_BRIDGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedClinicalDocumentsPersistenceBridgeGovernance = typeof GOVERNED_CLINICAL_DOCUMENTS_PERSISTENCE_BRIDGE_GOVERNANCE;

export type GovernedClinicalDocumentsPersistenceBridgeComponentKey =
  | "infrastructure"
  | "bridge"
  | "binding"
  | "validation"
  | "preview"
  | "execution"
  | "readiness";

export type GovernedClinicalDocumentsPersistenceBridgeComponentPresence = {
  key: GovernedClinicalDocumentsPersistenceBridgeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedClinicalDocumentsPersistenceBridgeResult = {
  runtime: unknown;
  status: string | null;
  components: GovernedClinicalDocumentsPersistenceBridgeComponentPresence[];
  governance: GovernedClinicalDocumentsPersistenceBridgeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  writeAttempted: false;
  repositoryInvoked: false;
};
