import { getMedicalCopilotGovernedRecommendationValidation } from "../../api";
import { mapGovernedRecommendationValidationEnvelope } from "./governed-recommendation-validation-mapper";
import type { GovernedRecommendationValidationResult } from "./governed-recommendation-validation";

export async function getGovernedRecommendationValidation(sessionId: string): Promise<GovernedRecommendationValidationResult | null> {
  const envelope = await getMedicalCopilotGovernedRecommendationValidation(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedRecommendationValidationEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedRecommendationValidationReadAdapter = { getGovernedRecommendationValidation: typeof getGovernedRecommendationValidation };
export const governedRecommendationValidationReadAdapter: GovernedRecommendationValidationReadAdapter = { getGovernedRecommendationValidation };
