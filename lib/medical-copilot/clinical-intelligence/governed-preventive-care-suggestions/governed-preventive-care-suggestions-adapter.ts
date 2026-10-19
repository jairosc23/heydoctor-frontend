import { getMedicalCopilotGovernedPreventiveCareSuggestions } from "../../api";
import { mapGovernedPreventiveCareSuggestionsEnvelope } from "./governed-preventive-care-suggestions-mapper";
import type { GovernedPreventiveCareSuggestionsResult } from "./governed-preventive-care-suggestions";

export async function getGovernedPreventiveCareSuggestions(sessionId: string): Promise<GovernedPreventiveCareSuggestionsResult | null> {
  const envelope = await getMedicalCopilotGovernedPreventiveCareSuggestions(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPreventiveCareSuggestionsEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedPreventiveCareSuggestionsReadAdapter = { getGovernedPreventiveCareSuggestions: typeof getGovernedPreventiveCareSuggestions };
export const governedPreventiveCareSuggestionsReadAdapter: GovernedPreventiveCareSuggestionsReadAdapter = { getGovernedPreventiveCareSuggestions };
