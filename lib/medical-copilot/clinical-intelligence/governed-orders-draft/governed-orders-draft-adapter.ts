import { getMedicalCopilotGovernedOrdersDraft } from "../../api";
import { mapGovernedOrdersDraftEnvelope } from "./governed-orders-draft-mapper";
import type { GovernedOrdersDraftResult } from "./governed-orders-draft";

export async function getGovernedOrdersDraft(
  sessionId: string,
): Promise<GovernedOrdersDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedOrdersDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedOrdersDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedOrdersDraftReadAdapter = {
  getGovernedOrdersDraft: typeof getGovernedOrdersDraft;
};

export const governedOrdersDraftReadAdapter: GovernedOrdersDraftReadAdapter = {
  getGovernedOrdersDraft,
};
