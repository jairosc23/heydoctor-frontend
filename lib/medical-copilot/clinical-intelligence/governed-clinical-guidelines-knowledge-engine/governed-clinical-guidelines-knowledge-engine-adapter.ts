import { getMedicalCopilotGovernedClinicalGuidelinesKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalGuidelinesKnowledgeEngineEnvelope } from "./governed-clinical-guidelines-knowledge-engine-mapper";
import type { GovernedClinicalGuidelinesKnowledgeEngineResult } from "./governed-clinical-guidelines-knowledge-engine";

export type GovernedClinicalGuidelinesKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedClinicalGuidelinesKnowledgeEngineResult | null>;
};

export async function getGovernedClinicalGuidelinesKnowledgeEngine(sessionId: string): Promise<GovernedClinicalGuidelinesKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalGuidelinesKnowledgeEngine(sessionId);
  return mapGovernedClinicalGuidelinesKnowledgeEngineEnvelope(envelope);
}

export const governedClinicalGuidelinesKnowledgeEngineReadAdapter: GovernedClinicalGuidelinesKnowledgeEngineReadAdapter = {
  get: getGovernedClinicalGuidelinesKnowledgeEngine,
};
