import { getMedicalCopilotGovernedRiskScoreKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRiskScoreKnowledgeEngineEnvelope } from "./governed-risk-score-knowledge-engine-mapper";
import type { GovernedRiskScoreKnowledgeEngineResult } from "./governed-risk-score-knowledge-engine";

export type GovernedRiskScoreKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedRiskScoreKnowledgeEngineResult | null>;
};

export async function getGovernedRiskScoreKnowledgeEngine(sessionId: string): Promise<GovernedRiskScoreKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedRiskScoreKnowledgeEngine(sessionId);
  return mapGovernedRiskScoreKnowledgeEngineEnvelope(envelope);
}

export const governedRiskScoreKnowledgeEngineReadAdapter: GovernedRiskScoreKnowledgeEngineReadAdapter = {
  get: getGovernedRiskScoreKnowledgeEngine,
};
