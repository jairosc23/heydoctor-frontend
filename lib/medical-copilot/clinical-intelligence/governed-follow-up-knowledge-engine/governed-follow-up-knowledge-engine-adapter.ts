import { getMedicalCopilotGovernedFollowUpKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedFollowUpKnowledgeEngineEnvelope } from "./governed-follow-up-knowledge-engine-mapper";
import type { GovernedFollowUpKnowledgeEngineResult } from "./governed-follow-up-knowledge-engine";

export type GovernedFollowUpKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedFollowUpKnowledgeEngineResult | null>;
};

export async function getGovernedFollowUpKnowledgeEngine(sessionId: string): Promise<GovernedFollowUpKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedFollowUpKnowledgeEngine(sessionId);
  return mapGovernedFollowUpKnowledgeEngineEnvelope(envelope);
}

export const governedFollowUpKnowledgeEngineReadAdapter: GovernedFollowUpKnowledgeEngineReadAdapter = {
  get: getGovernedFollowUpKnowledgeEngine,
};
