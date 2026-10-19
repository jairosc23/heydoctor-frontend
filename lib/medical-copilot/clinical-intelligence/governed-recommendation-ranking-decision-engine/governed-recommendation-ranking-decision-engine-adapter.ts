import { getMedicalCopilotGovernedRecommendationRankingEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRecommendationRankingEngineEnvelope } from "./governed-recommendation-ranking-decision-engine-mapper";
import type { GovernedRecommendationRankingEngineResult } from "./governed-recommendation-ranking-decision-engine";
export type GovernedRecommendationRankingEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedRecommendationRankingEngineResult | null> };
export async function getGovernedRecommendationRankingEngine(sessionId: string): Promise<GovernedRecommendationRankingEngineResult | null> {
  return mapGovernedRecommendationRankingEngineEnvelope(await getMedicalCopilotGovernedRecommendationRankingEngine(sessionId));
}
export const governedRecommendationRankingEngineReadAdapter: GovernedRecommendationRankingEngineReadAdapter = { get: getGovernedRecommendationRankingEngine };
