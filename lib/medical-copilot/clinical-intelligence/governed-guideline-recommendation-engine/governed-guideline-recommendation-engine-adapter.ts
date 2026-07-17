import { getMedicalCopilotGovernedGuidelineRecommendationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGuidelineRecommendationEngineEnvelope } from "./governed-guideline-recommendation-engine-mapper";
import type { GovernedGuidelineRecommendationEngineResult } from "./governed-guideline-recommendation-engine";

export type GovernedGuidelineRecommendationEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGuidelineRecommendationEngineResult | null>;
};

export async function getGovernedGuidelineRecommendationEngine(sessionId: string): Promise<GovernedGuidelineRecommendationEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGuidelineRecommendationEngine(sessionId);
  return mapGovernedGuidelineRecommendationEngineEnvelope(envelope);
}

export const governedGuidelineRecommendationEngineReadAdapter: GovernedGuidelineRecommendationEngineReadAdapter = { get: getGovernedGuidelineRecommendationEngine };
