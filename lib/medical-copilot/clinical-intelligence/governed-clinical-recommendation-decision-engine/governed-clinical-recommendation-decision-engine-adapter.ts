import { getMedicalCopilotGovernedClinicalRecommendationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalRecommendationEngineEnvelope } from "./governed-clinical-recommendation-decision-engine-mapper";
import type { GovernedClinicalRecommendationEngineResult } from "./governed-clinical-recommendation-decision-engine";
export type GovernedClinicalRecommendationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalRecommendationEngineResult | null> };
export async function getGovernedClinicalRecommendationEngine(sessionId: string): Promise<GovernedClinicalRecommendationEngineResult | null> {
  return mapGovernedClinicalRecommendationEngineEnvelope(await getMedicalCopilotGovernedClinicalRecommendationEngine(sessionId));
}
export const governedClinicalRecommendationEngineReadAdapter: GovernedClinicalRecommendationEngineReadAdapter = { get: getGovernedClinicalRecommendationEngine };
