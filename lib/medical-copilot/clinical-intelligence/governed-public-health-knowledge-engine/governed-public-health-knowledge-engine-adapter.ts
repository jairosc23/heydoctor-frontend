import { getMedicalCopilotGovernedPublicHealthKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPublicHealthKnowledgeEngineEnvelope } from "./governed-public-health-knowledge-engine-mapper";
import type { GovernedPublicHealthKnowledgeEngineResult } from "./governed-public-health-knowledge-engine";

export type GovernedPublicHealthKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedPublicHealthKnowledgeEngineResult | null>;
};

export async function getGovernedPublicHealthKnowledgeEngine(sessionId: string): Promise<GovernedPublicHealthKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPublicHealthKnowledgeEngine(sessionId);
  return mapGovernedPublicHealthKnowledgeEngineEnvelope(envelope);
}

export const governedPublicHealthKnowledgeEngineReadAdapter: GovernedPublicHealthKnowledgeEngineReadAdapter = {
  get: getGovernedPublicHealthKnowledgeEngine,
};
