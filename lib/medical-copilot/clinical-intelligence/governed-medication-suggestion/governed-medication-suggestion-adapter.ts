import { getMedicalCopilotGovernedMedicationSuggestion } from "../../api";
import { mapGovernedMedicationSuggestionEnvelope } from "./governed-medication-suggestion-mapper";
import type { GovernedMedicationSuggestionResult } from "./governed-medication-suggestion";

export async function getGovernedMedicationSuggestion(sessionId: string): Promise<GovernedMedicationSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedMedicationSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedMedicationSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedMedicationSuggestionReadAdapter = { getGovernedMedicationSuggestion: typeof getGovernedMedicationSuggestion };
export const governedMedicationSuggestionReadAdapter: GovernedMedicationSuggestionReadAdapter = { getGovernedMedicationSuggestion };
