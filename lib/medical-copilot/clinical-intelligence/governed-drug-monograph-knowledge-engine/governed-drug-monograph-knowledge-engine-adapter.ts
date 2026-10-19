import { getMedicalCopilotGovernedDrugMonographKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDrugMonographKnowledgeEngineEnvelope } from "./governed-drug-monograph-knowledge-engine-mapper";
import type { GovernedDrugMonographKnowledgeEngineResult } from "./governed-drug-monograph-knowledge-engine";

export type GovernedDrugMonographKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedDrugMonographKnowledgeEngineResult | null>;
};

export async function getGovernedDrugMonographKnowledgeEngine(sessionId: string): Promise<GovernedDrugMonographKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDrugMonographKnowledgeEngine(sessionId);
  return mapGovernedDrugMonographKnowledgeEngineEnvelope(envelope);
}

export const governedDrugMonographKnowledgeEngineReadAdapter: GovernedDrugMonographKnowledgeEngineReadAdapter = {
  get: getGovernedDrugMonographKnowledgeEngine,
};
