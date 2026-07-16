import { getMedicalCopilotGovernedOrdersSuggestion } from "../../api";
import { mapGovernedOrdersSuggestionEnvelope } from "./governed-orders-suggestion-mapper";
import type { GovernedOrdersSuggestionResult } from "./governed-orders-suggestion";

export async function getGovernedOrdersSuggestion(sessionId: string): Promise<GovernedOrdersSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedOrdersSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedOrdersSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedOrdersSuggestionReadAdapter = { getGovernedOrdersSuggestion: typeof getGovernedOrdersSuggestion };
export const governedOrdersSuggestionReadAdapter: GovernedOrdersSuggestionReadAdapter = { getGovernedOrdersSuggestion };
