import { getMedicalCopilotGovernedLaboratoryKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedLaboratoryKnowledgeEngineEnvelope } from "./governed-laboratory-knowledge-engine-mapper";
import type { GovernedLaboratoryKnowledgeEngineResult } from "./governed-laboratory-knowledge-engine";

export type GovernedLaboratoryKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedLaboratoryKnowledgeEngineResult | null>;
};

export async function getGovernedLaboratoryKnowledgeEngine(sessionId: string): Promise<GovernedLaboratoryKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedLaboratoryKnowledgeEngine(sessionId);
  return mapGovernedLaboratoryKnowledgeEngineEnvelope(envelope);
}

export const governedLaboratoryKnowledgeEngineReadAdapter: GovernedLaboratoryKnowledgeEngineReadAdapter = {
  get: getGovernedLaboratoryKnowledgeEngine,
};
