import { getMedicalCopilotGovernedConsultationPersistenceBridge } from "../../api";
import { mapGovernedConsultationPersistenceBridgeEnvelope } from "./governed-consultation-persistence-bridge-mapper";
import type { GovernedConsultationPersistenceBridgeResult } from "./governed-consultation-persistence-bridge";

export async function getGovernedConsultationPersistenceBridge(
  sessionId: string,
): Promise<GovernedConsultationPersistenceBridgeResult | null> {
  const envelope =
    await getMedicalCopilotGovernedConsultationPersistenceBridge(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationPersistenceBridgeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationPersistenceBridgeReadAdapter = {
  getGovernedConsultationPersistenceBridge: typeof getGovernedConsultationPersistenceBridge;
};

export const governedConsultationPersistenceBridgeReadAdapter: GovernedConsultationPersistenceBridgeReadAdapter =
  {
    getGovernedConsultationPersistenceBridge,
  };
