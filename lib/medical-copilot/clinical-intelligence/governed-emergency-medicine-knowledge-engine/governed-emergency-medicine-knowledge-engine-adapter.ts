import { getMedicalCopilotGovernedEmergencyMedicineKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEmergencyMedicineKnowledgeEngineEnvelope } from "./governed-emergency-medicine-knowledge-engine-mapper";
import type { GovernedEmergencyMedicineKnowledgeEngineResult } from "./governed-emergency-medicine-knowledge-engine";

export type GovernedEmergencyMedicineKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedEmergencyMedicineKnowledgeEngineResult | null>;
};

export async function getGovernedEmergencyMedicineKnowledgeEngine(sessionId: string): Promise<GovernedEmergencyMedicineKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedEmergencyMedicineKnowledgeEngine(sessionId);
  return mapGovernedEmergencyMedicineKnowledgeEngineEnvelope(envelope);
}

export const governedEmergencyMedicineKnowledgeEngineReadAdapter: GovernedEmergencyMedicineKnowledgeEngineReadAdapter = {
  get: getGovernedEmergencyMedicineKnowledgeEngine,
};
