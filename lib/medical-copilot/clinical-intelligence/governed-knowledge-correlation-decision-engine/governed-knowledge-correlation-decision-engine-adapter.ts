import { getMedicalCopilotGovernedKnowledgeCorrelationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedKnowledgeCorrelationEngineEnvelope } from "./governed-knowledge-correlation-decision-engine-mapper";
import type { GovernedKnowledgeCorrelationEngineResult } from "./governed-knowledge-correlation-decision-engine";
export type GovernedKnowledgeCorrelationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedKnowledgeCorrelationEngineResult | null> };
export async function getGovernedKnowledgeCorrelationEngine(sessionId: string): Promise<GovernedKnowledgeCorrelationEngineResult | null> {
  return mapGovernedKnowledgeCorrelationEngineEnvelope(await getMedicalCopilotGovernedKnowledgeCorrelationEngine(sessionId));
}
export const governedKnowledgeCorrelationEngineReadAdapter: GovernedKnowledgeCorrelationEngineReadAdapter = { get: getGovernedKnowledgeCorrelationEngine };
