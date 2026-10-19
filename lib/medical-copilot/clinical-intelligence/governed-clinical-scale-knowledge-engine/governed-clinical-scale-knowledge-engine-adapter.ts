import { getMedicalCopilotGovernedClinicalScaleKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalScaleKnowledgeEngineEnvelope } from "./governed-clinical-scale-knowledge-engine-mapper";
import type { GovernedClinicalScaleKnowledgeEngineResult } from "./governed-clinical-scale-knowledge-engine";

export type GovernedClinicalScaleKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedClinicalScaleKnowledgeEngineResult | null>;
};

export async function getGovernedClinicalScaleKnowledgeEngine(sessionId: string): Promise<GovernedClinicalScaleKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalScaleKnowledgeEngine(sessionId);
  return mapGovernedClinicalScaleKnowledgeEngineEnvelope(envelope);
}

export const governedClinicalScaleKnowledgeEngineReadAdapter: GovernedClinicalScaleKnowledgeEngineReadAdapter = {
  get: getGovernedClinicalScaleKnowledgeEngine,
};
