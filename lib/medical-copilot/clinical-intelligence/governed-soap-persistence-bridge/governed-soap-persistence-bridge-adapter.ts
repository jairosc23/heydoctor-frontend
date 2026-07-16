import { getMedicalCopilotGovernedSoapPersistenceBridge } from "../../api";
import { mapGovernedSoapPersistenceBridgeEnvelope } from "./governed-soap-persistence-bridge-mapper";
import type { GovernedSoapPersistenceBridgeResult } from "./governed-soap-persistence-bridge";

export async function getGovernedSoapPersistenceBridge(
  sessionId: string,
): Promise<GovernedSoapPersistenceBridgeResult | null> {
  const envelope = await getMedicalCopilotGovernedSoapPersistenceBridge(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedSoapPersistenceBridgeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedSoapPersistenceBridgeReadAdapter = {
  getGovernedSoapPersistenceBridge: typeof getGovernedSoapPersistenceBridge;
};

export const governedSoapPersistenceBridgeReadAdapter: GovernedSoapPersistenceBridgeReadAdapter = {
  getGovernedSoapPersistenceBridge,
};
