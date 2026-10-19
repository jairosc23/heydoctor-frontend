import { getMedicalCopilotGovernedTreatmentSuggestion } from "../../api";
import { mapGovernedTreatmentSuggestionEnvelope } from "./governed-treatment-suggestion-mapper";
import type { GovernedTreatmentSuggestionResult } from "./governed-treatment-suggestion";

export async function getGovernedTreatmentSuggestion(sessionId: string): Promise<GovernedTreatmentSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedTreatmentSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedTreatmentSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedTreatmentSuggestionReadAdapter = { getGovernedTreatmentSuggestion: typeof getGovernedTreatmentSuggestion };
export const governedTreatmentSuggestionReadAdapter: GovernedTreatmentSuggestionReadAdapter = { getGovernedTreatmentSuggestion };
