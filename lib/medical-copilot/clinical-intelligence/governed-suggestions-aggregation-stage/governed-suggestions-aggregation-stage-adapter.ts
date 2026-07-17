import { getMedicalCopilotGovernedSuggestionsAggregationStage } from "../../api";
import { mapGovernedSuggestionsAggregationStageEnvelope } from "./governed-suggestions-aggregation-stage-mapper";
import type { GovernedSuggestionsAggregationStageResult } from "./governed-suggestions-aggregation-stage";
export async function getGovernedSuggestionsAggregationStage(sessionId: string): Promise<GovernedSuggestionsAggregationStageResult | null> {
  const envelope = await getMedicalCopilotGovernedSuggestionsAggregationStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedSuggestionsAggregationStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedSuggestionsAggregationStageReadAdapter = { getGovernedSuggestionsAggregationStage: typeof getGovernedSuggestionsAggregationStage };
export const governedSuggestionsAggregationStageReadAdapter: GovernedSuggestionsAggregationStageReadAdapter = { getGovernedSuggestionsAggregationStage };
