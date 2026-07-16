import { getMedicalCopilotGovernedNutritionKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedNutritionKnowledgeEngineEnvelope } from "./governed-nutrition-knowledge-engine-mapper";
import type { GovernedNutritionKnowledgeEngineResult } from "./governed-nutrition-knowledge-engine";

export type GovernedNutritionKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedNutritionKnowledgeEngineResult | null>;
};

export async function getGovernedNutritionKnowledgeEngine(sessionId: string): Promise<GovernedNutritionKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedNutritionKnowledgeEngine(sessionId);
  return mapGovernedNutritionKnowledgeEngineEnvelope(envelope);
}

export const governedNutritionKnowledgeEngineReadAdapter: GovernedNutritionKnowledgeEngineReadAdapter = {
  get: getGovernedNutritionKnowledgeEngine,
};
