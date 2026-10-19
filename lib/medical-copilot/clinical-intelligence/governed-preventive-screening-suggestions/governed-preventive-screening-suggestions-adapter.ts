import { getMedicalCopilotGovernedPreventiveScreeningSuggestions } from "../../api";
import { mapGovernedPreventiveScreeningSuggestionsEnvelope } from "./governed-preventive-screening-suggestions-mapper";
import type { GovernedPreventiveScreeningSuggestionsResult } from "./governed-preventive-screening-suggestions";

export async function getGovernedPreventiveScreeningSuggestions(sessionId: string): Promise<GovernedPreventiveScreeningSuggestionsResult | null> {
  const envelope = await getMedicalCopilotGovernedPreventiveScreeningSuggestions(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPreventiveScreeningSuggestionsEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedPreventiveScreeningSuggestionsReadAdapter = { getGovernedPreventiveScreeningSuggestions: typeof getGovernedPreventiveScreeningSuggestions };
export const governedPreventiveScreeningSuggestionsReadAdapter: GovernedPreventiveScreeningSuggestionsReadAdapter = { getGovernedPreventiveScreeningSuggestions };
