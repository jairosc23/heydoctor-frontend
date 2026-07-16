import { getMedicalCopilotGovernedRecommendationPrioritizationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRecommendationPrioritizationEngineEnvelope } from "./governed-recommendation-prioritization-decision-engine-mapper";
import type { GovernedRecommendationPrioritizationEngineResult } from "./governed-recommendation-prioritization-decision-engine";
export type GovernedRecommendationPrioritizationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedRecommendationPrioritizationEngineResult | null> };
export async function getGovernedRecommendationPrioritizationEngine(sessionId: string): Promise<GovernedRecommendationPrioritizationEngineResult | null> {
  return mapGovernedRecommendationPrioritizationEngineEnvelope(await getMedicalCopilotGovernedRecommendationPrioritizationEngine(sessionId));
}
export const governedRecommendationPrioritizationEngineReadAdapter: GovernedRecommendationPrioritizationEngineReadAdapter = { get: getGovernedRecommendationPrioritizationEngine };
