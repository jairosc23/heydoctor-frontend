import { getMedicalCopilotGovernedReferralSuggestion } from "../../api";
import { mapGovernedReferralSuggestionEnvelope } from "./governed-referral-suggestion-mapper";
import type { GovernedReferralSuggestionResult } from "./governed-referral-suggestion";

export async function getGovernedReferralSuggestion(sessionId: string): Promise<GovernedReferralSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedReferralSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedReferralSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedReferralSuggestionReadAdapter = { getGovernedReferralSuggestion: typeof getGovernedReferralSuggestion };
export const governedReferralSuggestionReadAdapter: GovernedReferralSuggestionReadAdapter = { getGovernedReferralSuggestion };
