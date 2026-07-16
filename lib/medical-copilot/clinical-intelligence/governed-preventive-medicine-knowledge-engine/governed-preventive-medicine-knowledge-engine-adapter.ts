import { getMedicalCopilotGovernedPreventiveMedicineKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPreventiveMedicineKnowledgeEngineEnvelope } from "./governed-preventive-medicine-knowledge-engine-mapper";
import type { GovernedPreventiveMedicineKnowledgeEngineResult } from "./governed-preventive-medicine-knowledge-engine";

export type GovernedPreventiveMedicineKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedPreventiveMedicineKnowledgeEngineResult | null>;
};

export async function getGovernedPreventiveMedicineKnowledgeEngine(sessionId: string): Promise<GovernedPreventiveMedicineKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPreventiveMedicineKnowledgeEngine(sessionId);
  return mapGovernedPreventiveMedicineKnowledgeEngineEnvelope(envelope);
}

export const governedPreventiveMedicineKnowledgeEngineReadAdapter: GovernedPreventiveMedicineKnowledgeEngineReadAdapter = {
  get: getGovernedPreventiveMedicineKnowledgeEngine,
};
