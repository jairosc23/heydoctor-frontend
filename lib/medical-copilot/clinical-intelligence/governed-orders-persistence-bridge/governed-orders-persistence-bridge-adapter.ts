import { getMedicalCopilotGovernedOrdersPersistenceBridge } from "../../api";
import { mapGovernedOrdersPersistenceBridgeEnvelope } from "./governed-orders-persistence-bridge-mapper";
import type { GovernedOrdersPersistenceBridgeResult } from "./governed-orders-persistence-bridge";

export async function getGovernedOrdersPersistenceBridge(
  sessionId: string,
): Promise<GovernedOrdersPersistenceBridgeResult | null> {
  const envelope = await getMedicalCopilotGovernedOrdersPersistenceBridge(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedOrdersPersistenceBridgeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedOrdersPersistenceBridgeReadAdapter = {
  getGovernedOrdersPersistenceBridge: typeof getGovernedOrdersPersistenceBridge;
};

export const governedOrdersPersistenceBridgeReadAdapter: GovernedOrdersPersistenceBridgeReadAdapter = {
  getGovernedOrdersPersistenceBridge,
};
