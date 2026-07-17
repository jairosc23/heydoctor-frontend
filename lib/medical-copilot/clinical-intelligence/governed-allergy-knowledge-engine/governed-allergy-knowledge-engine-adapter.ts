import { getMedicalCopilotGovernedAllergyKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAllergyKnowledgeEngineEnvelope } from "./governed-allergy-knowledge-engine-mapper";
import type { GovernedAllergyKnowledgeEngineResult } from "./governed-allergy-knowledge-engine";

export type GovernedAllergyKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedAllergyKnowledgeEngineResult | null>;
};

export async function getGovernedAllergyKnowledgeEngine(sessionId: string): Promise<GovernedAllergyKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAllergyKnowledgeEngine(sessionId);
  return mapGovernedAllergyKnowledgeEngineEnvelope(envelope);
}

export const governedAllergyKnowledgeEngineReadAdapter: GovernedAllergyKnowledgeEngineReadAdapter = {
  get: getGovernedAllergyKnowledgeEngine,
};
