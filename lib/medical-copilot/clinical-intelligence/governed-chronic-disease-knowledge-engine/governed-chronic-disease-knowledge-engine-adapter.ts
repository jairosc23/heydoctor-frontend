import { getMedicalCopilotGovernedChronicDiseaseKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedChronicDiseaseKnowledgeEngineEnvelope } from "./governed-chronic-disease-knowledge-engine-mapper";
import type { GovernedChronicDiseaseKnowledgeEngineResult } from "./governed-chronic-disease-knowledge-engine";

export type GovernedChronicDiseaseKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedChronicDiseaseKnowledgeEngineResult | null>;
};

export async function getGovernedChronicDiseaseKnowledgeEngine(sessionId: string): Promise<GovernedChronicDiseaseKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedChronicDiseaseKnowledgeEngine(sessionId);
  return mapGovernedChronicDiseaseKnowledgeEngineEnvelope(envelope);
}

export const governedChronicDiseaseKnowledgeEngineReadAdapter: GovernedChronicDiseaseKnowledgeEngineReadAdapter = {
  get: getGovernedChronicDiseaseKnowledgeEngine,
};
