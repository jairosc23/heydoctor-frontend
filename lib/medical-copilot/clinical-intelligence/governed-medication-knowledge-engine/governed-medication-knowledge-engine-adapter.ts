import { getMedicalCopilotGovernedMedicationKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMedicationKnowledgeEngineEnvelope } from "./governed-medication-knowledge-engine-mapper";
import type { GovernedMedicationKnowledgeEngineResult } from "./governed-medication-knowledge-engine";

export type GovernedMedicationKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedMedicationKnowledgeEngineResult | null>;
};

export async function getGovernedMedicationKnowledgeEngine(sessionId: string): Promise<GovernedMedicationKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedMedicationKnowledgeEngine(sessionId);
  return mapGovernedMedicationKnowledgeEngineEnvelope(envelope);
}

export const governedMedicationKnowledgeEngineReadAdapter: GovernedMedicationKnowledgeEngineReadAdapter = {
  get: getGovernedMedicationKnowledgeEngine,
};
