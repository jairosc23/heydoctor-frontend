import { getMedicalCopilotGovernedRedFlagKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRedFlagKnowledgeEngineEnvelope } from "./governed-red-flag-knowledge-engine-mapper";
import type { GovernedRedFlagKnowledgeEngineResult } from "./governed-red-flag-knowledge-engine";

export type GovernedRedFlagKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedRedFlagKnowledgeEngineResult | null>;
};

export async function getGovernedRedFlagKnowledgeEngine(sessionId: string): Promise<GovernedRedFlagKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedRedFlagKnowledgeEngine(sessionId);
  return mapGovernedRedFlagKnowledgeEngineEnvelope(envelope);
}

export const governedRedFlagKnowledgeEngineReadAdapter: GovernedRedFlagKnowledgeEngineReadAdapter = {
  get: getGovernedRedFlagKnowledgeEngine,
};
