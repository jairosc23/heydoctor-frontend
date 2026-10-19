import { getMedicalCopilotGovernedVaccineKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedVaccineKnowledgeEngineEnvelope } from "./governed-vaccine-knowledge-engine-mapper";
import type { GovernedVaccineKnowledgeEngineResult } from "./governed-vaccine-knowledge-engine";

export type GovernedVaccineKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedVaccineKnowledgeEngineResult | null>;
};

export async function getGovernedVaccineKnowledgeEngine(sessionId: string): Promise<GovernedVaccineKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedVaccineKnowledgeEngine(sessionId);
  return mapGovernedVaccineKnowledgeEngineEnvelope(envelope);
}

export const governedVaccineKnowledgeEngineReadAdapter: GovernedVaccineKnowledgeEngineReadAdapter = {
  get: getGovernedVaccineKnowledgeEngine,
};
