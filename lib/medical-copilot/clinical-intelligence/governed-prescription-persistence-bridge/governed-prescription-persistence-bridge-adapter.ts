import { getMedicalCopilotGovernedPrescriptionPersistenceBridge } from "../../api";
import { mapGovernedPrescriptionPersistenceBridgeEnvelope } from "./governed-prescription-persistence-bridge-mapper";
import type { GovernedPrescriptionPersistenceBridgeResult } from "./governed-prescription-persistence-bridge";

export async function getGovernedPrescriptionPersistenceBridge(
  sessionId: string,
): Promise<GovernedPrescriptionPersistenceBridgeResult | null> {
  const envelope = await getMedicalCopilotGovernedPrescriptionPersistenceBridge(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPrescriptionPersistenceBridgeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPrescriptionPersistenceBridgeReadAdapter = {
  getGovernedPrescriptionPersistenceBridge: typeof getGovernedPrescriptionPersistenceBridge;
};

export const governedPrescriptionPersistenceBridgeReadAdapter: GovernedPrescriptionPersistenceBridgeReadAdapter = {
  getGovernedPrescriptionPersistenceBridge,
};
