import { getMedicalCopilotGovernedGeriatricsKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGeriatricsKnowledgeEngineEnvelope } from "./governed-geriatrics-knowledge-engine-mapper";
import type { GovernedGeriatricsKnowledgeEngineResult } from "./governed-geriatrics-knowledge-engine";

export type GovernedGeriatricsKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedGeriatricsKnowledgeEngineResult | null>;
};

export async function getGovernedGeriatricsKnowledgeEngine(sessionId: string): Promise<GovernedGeriatricsKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGeriatricsKnowledgeEngine(sessionId);
  return mapGovernedGeriatricsKnowledgeEngineEnvelope(envelope);
}

export const governedGeriatricsKnowledgeEngineReadAdapter: GovernedGeriatricsKnowledgeEngineReadAdapter = {
  get: getGovernedGeriatricsKnowledgeEngine,
};
