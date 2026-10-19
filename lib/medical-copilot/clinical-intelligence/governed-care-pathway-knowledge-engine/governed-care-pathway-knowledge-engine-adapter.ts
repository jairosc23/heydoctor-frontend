import { getMedicalCopilotGovernedCarePathwayKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCarePathwayKnowledgeEngineEnvelope } from "./governed-care-pathway-knowledge-engine-mapper";
import type { GovernedCarePathwayKnowledgeEngineResult } from "./governed-care-pathway-knowledge-engine";

export type GovernedCarePathwayKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedCarePathwayKnowledgeEngineResult | null>;
};

export async function getGovernedCarePathwayKnowledgeEngine(sessionId: string): Promise<GovernedCarePathwayKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedCarePathwayKnowledgeEngine(sessionId);
  return mapGovernedCarePathwayKnowledgeEngineEnvelope(envelope);
}

export const governedCarePathwayKnowledgeEngineReadAdapter: GovernedCarePathwayKnowledgeEngineReadAdapter = {
  get: getGovernedCarePathwayKnowledgeEngine,
};
