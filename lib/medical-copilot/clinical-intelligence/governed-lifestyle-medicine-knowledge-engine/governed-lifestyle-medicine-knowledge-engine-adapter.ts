import { getMedicalCopilotGovernedLifestyleMedicineKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedLifestyleMedicineKnowledgeEngineEnvelope } from "./governed-lifestyle-medicine-knowledge-engine-mapper";
import type { GovernedLifestyleMedicineKnowledgeEngineResult } from "./governed-lifestyle-medicine-knowledge-engine";

export type GovernedLifestyleMedicineKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedLifestyleMedicineKnowledgeEngineResult | null>;
};

export async function getGovernedLifestyleMedicineKnowledgeEngine(sessionId: string): Promise<GovernedLifestyleMedicineKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedLifestyleMedicineKnowledgeEngine(sessionId);
  return mapGovernedLifestyleMedicineKnowledgeEngineEnvelope(envelope);
}

export const governedLifestyleMedicineKnowledgeEngineReadAdapter: GovernedLifestyleMedicineKnowledgeEngineReadAdapter = {
  get: getGovernedLifestyleMedicineKnowledgeEngine,
};
