import { getMedicalCopilotGovernedClinicalAssessmentSuggestion } from "../../api";
import { mapGovernedClinicalAssessmentSuggestionEnvelope } from "./governed-clinical-assessment-suggestion-mapper";
import type { GovernedClinicalAssessmentSuggestionResult } from "./governed-clinical-assessment-suggestion";

export async function getGovernedClinicalAssessmentSuggestion(sessionId: string): Promise<GovernedClinicalAssessmentSuggestionResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalAssessmentSuggestion(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalAssessmentSuggestionEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalAssessmentSuggestionReadAdapter = { getGovernedClinicalAssessmentSuggestion: typeof getGovernedClinicalAssessmentSuggestion };
export const governedClinicalAssessmentSuggestionReadAdapter: GovernedClinicalAssessmentSuggestionReadAdapter = { getGovernedClinicalAssessmentSuggestion };
