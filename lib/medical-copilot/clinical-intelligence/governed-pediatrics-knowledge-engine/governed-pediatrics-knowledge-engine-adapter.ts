import { getMedicalCopilotGovernedPediatricsKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPediatricsKnowledgeEngineEnvelope } from "./governed-pediatrics-knowledge-engine-mapper";
import type { GovernedPediatricsKnowledgeEngineResult } from "./governed-pediatrics-knowledge-engine";

export type GovernedPediatricsKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedPediatricsKnowledgeEngineResult | null>;
};

export async function getGovernedPediatricsKnowledgeEngine(sessionId: string): Promise<GovernedPediatricsKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPediatricsKnowledgeEngine(sessionId);
  return mapGovernedPediatricsKnowledgeEngineEnvelope(envelope);
}

export const governedPediatricsKnowledgeEngineReadAdapter: GovernedPediatricsKnowledgeEngineReadAdapter = {
  get: getGovernedPediatricsKnowledgeEngine,
};
