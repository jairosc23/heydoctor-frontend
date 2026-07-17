import { getMedicalCopilotGovernedDiseaseKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiseaseKnowledgeEngineEnvelope } from "./governed-disease-knowledge-engine-mapper";
import type { GovernedDiseaseKnowledgeEngineResult } from "./governed-disease-knowledge-engine";

export type GovernedDiseaseKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedDiseaseKnowledgeEngineResult | null>;
};

export async function getGovernedDiseaseKnowledgeEngine(sessionId: string): Promise<GovernedDiseaseKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDiseaseKnowledgeEngine(sessionId);
  return mapGovernedDiseaseKnowledgeEngineEnvelope(envelope);
}

export const governedDiseaseKnowledgeEngineReadAdapter: GovernedDiseaseKnowledgeEngineReadAdapter = {
  get: getGovernedDiseaseKnowledgeEngine,
};
