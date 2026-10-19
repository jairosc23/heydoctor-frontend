import { getMedicalCopilotGovernedMentalHealthKnowledgeEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMentalHealthKnowledgeEngineEnvelope } from "./governed-mental-health-knowledge-engine-mapper";
import type { GovernedMentalHealthKnowledgeEngineResult } from "./governed-mental-health-knowledge-engine";

export type GovernedMentalHealthKnowledgeEngineReadAdapter = {
  get: (sessionId: string) => Promise<GovernedMentalHealthKnowledgeEngineResult | null>;
};

export async function getGovernedMentalHealthKnowledgeEngine(sessionId: string): Promise<GovernedMentalHealthKnowledgeEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedMentalHealthKnowledgeEngine(sessionId);
  return mapGovernedMentalHealthKnowledgeEngineEnvelope(envelope);
}

export const governedMentalHealthKnowledgeEngineReadAdapter: GovernedMentalHealthKnowledgeEngineReadAdapter = {
  get: getGovernedMentalHealthKnowledgeEngine,
};
