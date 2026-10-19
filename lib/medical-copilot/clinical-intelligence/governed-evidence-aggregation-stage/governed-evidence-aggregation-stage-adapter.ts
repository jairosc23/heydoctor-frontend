import { getMedicalCopilotGovernedEvidenceAggregationStage } from "../../api";
import { mapGovernedEvidenceAggregationStageEnvelope } from "./governed-evidence-aggregation-stage-mapper";
import type { GovernedEvidenceAggregationStageResult } from "./governed-evidence-aggregation-stage";
export async function getGovernedEvidenceAggregationStage(sessionId: string): Promise<GovernedEvidenceAggregationStageResult | null> {
  const envelope = await getMedicalCopilotGovernedEvidenceAggregationStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedEvidenceAggregationStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedEvidenceAggregationStageReadAdapter = { getGovernedEvidenceAggregationStage: typeof getGovernedEvidenceAggregationStage };
export const governedEvidenceAggregationStageReadAdapter: GovernedEvidenceAggregationStageReadAdapter = { getGovernedEvidenceAggregationStage };
