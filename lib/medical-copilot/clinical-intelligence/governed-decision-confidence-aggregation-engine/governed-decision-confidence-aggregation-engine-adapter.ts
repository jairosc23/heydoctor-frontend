import { getMedicalCopilotGovernedDecisionConfidenceAggregationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDecisionConfidenceAggregationEngineEnvelope } from "./governed-decision-confidence-aggregation-engine-mapper";
import type { GovernedDecisionConfidenceAggregationEngineResult } from "./governed-decision-confidence-aggregation-engine";
export type GovernedDecisionConfidenceAggregationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDecisionConfidenceAggregationEngineResult | null> };
export async function getGovernedDecisionConfidenceAggregationEngine(sessionId: string): Promise<GovernedDecisionConfidenceAggregationEngineResult | null> {
  return mapGovernedDecisionConfidenceAggregationEngineEnvelope(await getMedicalCopilotGovernedDecisionConfidenceAggregationEngine(sessionId));
}
export const governedDecisionConfidenceAggregationEngineReadAdapter: GovernedDecisionConfidenceAggregationEngineReadAdapter = { get: getGovernedDecisionConfidenceAggregationEngine };
