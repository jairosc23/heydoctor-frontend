import { getMedicalCopilotGovernedSocietyRecommendationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedSocietyRecommendationEngineEnvelope } from "./governed-society-recommendation-engine-mapper";
import type { GovernedSocietyRecommendationEngineResult } from "./governed-society-recommendation-engine";

export type GovernedSocietyRecommendationEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedSocietyRecommendationEngineResult | null>;
};

export async function getGovernedSocietyRecommendationEngine(sessionId: string): Promise<GovernedSocietyRecommendationEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedSocietyRecommendationEngine(sessionId);
  return mapGovernedSocietyRecommendationEngineEnvelope(envelope);
}

export const governedSocietyRecommendationEngineReadAdapter: GovernedSocietyRecommendationEngineReadAdapter = {
  get: getGovernedSocietyRecommendationEngine,
};
