export const GOVERNED_ORDERS_PERSISTENCE_BRIDGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedOrdersPersistenceBridgeGovernance = typeof GOVERNED_ORDERS_PERSISTENCE_BRIDGE_GOVERNANCE;

export type GovernedOrdersPersistenceBridgeComponentKey =
  | "infrastructure"
  | "bridge"
  | "binding"
  | "validation"
  | "preview"
  | "execution"
  | "readiness";

export type GovernedOrdersPersistenceBridgeComponentPresence = {
  key: GovernedOrdersPersistenceBridgeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedOrdersPersistenceBridgeResult = {
  runtime: unknown;
  status: string | null;
  components: GovernedOrdersPersistenceBridgeComponentPresence[];
  governance: GovernedOrdersPersistenceBridgeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  writeAttempted: false;
  repositoryInvoked: false;
};
