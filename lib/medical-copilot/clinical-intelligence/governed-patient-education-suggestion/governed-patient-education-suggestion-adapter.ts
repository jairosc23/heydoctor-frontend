import { getMedicalCopilotGovernedPatientEducationSuggestion } from "../../api";
import { mapGovernedPatientEducationSuggestionEnvelope } from "./governed-patient-education-suggestion-mapper";
import type { GovernedPatientEducationSuggestionResult } from "./governed-patient-education-suggestion";

export async function getGovernedPatientEducationSuggestion(sessionId: string): Promise<GovernedPatientEducationSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedPatientEducationSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPatientEducationSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedPatientEducationSuggestionReadAdapter = { getGovernedPatientEducationSuggestion: typeof getGovernedPatientEducationSuggestion };
export const governedPatientEducationSuggestionReadAdapter: GovernedPatientEducationSuggestionReadAdapter = { getGovernedPatientEducationSuggestion };
