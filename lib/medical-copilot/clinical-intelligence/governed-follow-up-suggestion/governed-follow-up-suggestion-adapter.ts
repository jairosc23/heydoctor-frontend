import { getMedicalCopilotGovernedFollowUpSuggestion } from "../../api";
import { mapGovernedFollowUpSuggestionEnvelope } from "./governed-follow-up-suggestion-mapper";
import type { GovernedFollowUpSuggestionResult } from "./governed-follow-up-suggestion";

export async function getGovernedFollowUpSuggestion(sessionId: string): Promise<GovernedFollowUpSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedFollowUpSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedFollowUpSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedFollowUpSuggestionReadAdapter = { getGovernedFollowUpSuggestion: typeof getGovernedFollowUpSuggestion };
export const governedFollowUpSuggestionReadAdapter: GovernedFollowUpSuggestionReadAdapter = { getGovernedFollowUpSuggestion };
