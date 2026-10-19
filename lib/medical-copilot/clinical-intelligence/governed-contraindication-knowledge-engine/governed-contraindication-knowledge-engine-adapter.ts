import { getMedicalCopilotGovernedContraindicationKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedContraindicationKnowledgeEngineEnvelope } from "./governed-contraindication-knowledge-engine-mapper";
import type { GovernedContraindicationKnowledgeEngineResult } from "./governed-contraindication-knowledge-engine";

export type GovernedContraindicationKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedContraindicationKnowledgeEngineResult | null>;
};

export async function getGovernedContraindicationKnowledgeEngine(sessionId: string): Promise<GovernedContraindicationKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedContraindicationKnowledgeEngine(sessionId);
  return mapGovernedContraindicationKnowledgeEngineEnvelope(envelope);
}

export const governedContraindicationKnowledgeEngineReadAdapter: GovernedContraindicationKnowledgeEngineReadAdapter = {
  get: getGovernedContraindicationKnowledgeEngine,
};
