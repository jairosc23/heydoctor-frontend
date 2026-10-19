import { getMedicalCopilotGovernedReferralPersistenceBridge } from "../../api";
import { mapGovernedReferralPersistenceBridgeEnvelope } from "./governed-referral-persistence-bridge-mapper";
import type { GovernedReferralPersistenceBridgeResult } from "./governed-referral-persistence-bridge";

export async function getGovernedReferralPersistenceBridge(
  sessionId: string,
): Promise<GovernedReferralPersistenceBridgeResult | null> {
  const envelope = await getMedicalCopilotGovernedReferralPersistenceBridge(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedReferralPersistenceBridgeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedReferralPersistenceBridgeReadAdapter = {
  getGovernedReferralPersistenceBridge: typeof getGovernedReferralPersistenceBridge;
};

export const governedReferralPersistenceBridgeReadAdapter: GovernedReferralPersistenceBridgeReadAdapter = {
  getGovernedReferralPersistenceBridge,
};
