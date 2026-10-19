export const GOVERNED_REFERRAL_PERSISTENCE_BRIDGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
};

export type GovernedReferralPersistenceBridgeGovernance = typeof GOVERNED_REFERRAL_PERSISTENCE_BRIDGE_GOVERNANCE;

export type GovernedReferralPersistenceBridgeComponentKey =
  | "infrastructure"
  | "bridge"
  | "binding"
  | "validation"
  | "preview"
  | "execution"
  | "readiness";

export type GovernedReferralPersistenceBridgeComponentPresence = {
  key: GovernedReferralPersistenceBridgeComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedReferralPersistenceBridgeResult = {
  runtime: unknown;
  status: string | null;
  components: GovernedReferralPersistenceBridgeComponentPresence[];
  governance: GovernedReferralPersistenceBridgeGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  writeAttempted: false;
  repositoryInvoked: false;
};
