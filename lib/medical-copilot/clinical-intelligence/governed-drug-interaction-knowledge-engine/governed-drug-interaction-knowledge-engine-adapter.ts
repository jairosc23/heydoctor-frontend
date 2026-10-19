import { getMedicalCopilotGovernedDrugInteractionKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDrugInteractionKnowledgeEngineEnvelope } from "./governed-drug-interaction-knowledge-engine-mapper";
import type { GovernedDrugInteractionKnowledgeEngineResult } from "./governed-drug-interaction-knowledge-engine";

export type GovernedDrugInteractionKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedDrugInteractionKnowledgeEngineResult | null>;
};

export async function getGovernedDrugInteractionKnowledgeEngine(sessionId: string): Promise<GovernedDrugInteractionKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDrugInteractionKnowledgeEngine(sessionId);
  return mapGovernedDrugInteractionKnowledgeEngineEnvelope(envelope);
}

export const governedDrugInteractionKnowledgeEngineReadAdapter: GovernedDrugInteractionKnowledgeEngineReadAdapter = {
  get: getGovernedDrugInteractionKnowledgeEngine,
};
