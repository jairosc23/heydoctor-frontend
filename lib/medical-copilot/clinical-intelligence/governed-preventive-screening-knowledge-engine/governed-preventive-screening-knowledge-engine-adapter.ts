import { getMedicalCopilotGovernedPreventiveScreeningKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPreventiveScreeningKnowledgeEngineEnvelope } from "./governed-preventive-screening-knowledge-engine-mapper";
import type { GovernedPreventiveScreeningKnowledgeEngineResult } from "./governed-preventive-screening-knowledge-engine";

export type GovernedPreventiveScreeningKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedPreventiveScreeningKnowledgeEngineResult | null>;
};

export async function getGovernedPreventiveScreeningKnowledgeEngine(sessionId: string): Promise<GovernedPreventiveScreeningKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPreventiveScreeningKnowledgeEngine(sessionId);
  return mapGovernedPreventiveScreeningKnowledgeEngineEnvelope(envelope);
}

export const governedPreventiveScreeningKnowledgeEngineReadAdapter: GovernedPreventiveScreeningKnowledgeEngineReadAdapter = {
  get: getGovernedPreventiveScreeningKnowledgeEngine,
};
