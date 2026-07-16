import { getMedicalCopilotGovernedEvidenceRecommendationStrengthEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEvidenceRecommendationStrengthEngineEnvelope } from "./governed-evidence-recommendation-strength-engine-mapper";
import type { GovernedEvidenceRecommendationStrengthEngineResult } from "./governed-evidence-recommendation-strength-engine";

export type GovernedEvidenceRecommendationStrengthEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEvidenceRecommendationStrengthEngineResult | null>;
};

export async function getGovernedEvidenceRecommendationStrengthEngine(sessionId: string): Promise<GovernedEvidenceRecommendationStrengthEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceRecommendationStrengthEngine(sessionId);
  return mapGovernedEvidenceRecommendationStrengthEngineEnvelope(envelope);
}

export const governedEvidenceRecommendationStrengthEngineReadAdapter: GovernedEvidenceRecommendationStrengthEngineReadAdapter = {
  get: getGovernedEvidenceRecommendationStrengthEngine,
};
