import { getMedicalCopilotGovernedWomensHealthKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedWomensHealthKnowledgeEngineEnvelope } from "./governed-womens-health-knowledge-engine-mapper";
import type { GovernedWomensHealthKnowledgeEngineResult } from "./governed-womens-health-knowledge-engine";

export type GovernedWomensHealthKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedWomensHealthKnowledgeEngineResult | null>;
};

export async function getGovernedWomensHealthKnowledgeEngine(sessionId: string): Promise<GovernedWomensHealthKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedWomensHealthKnowledgeEngine(sessionId);
  return mapGovernedWomensHealthKnowledgeEngineEnvelope(envelope);
}

export const governedWomensHealthKnowledgeEngineReadAdapter: GovernedWomensHealthKnowledgeEngineReadAdapter = {
  get: getGovernedWomensHealthKnowledgeEngine,
};
