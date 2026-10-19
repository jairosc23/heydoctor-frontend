import { getMedicalCopilotGovernedRulesEvaluationStage } from "../../api";
import { mapGovernedRulesEvaluationStageEnvelope } from "./governed-rules-evaluation-stage-mapper";
import type { GovernedRulesEvaluationStageResult } from "./governed-rules-evaluation-stage";
export async function getGovernedRulesEvaluationStage(sessionId: string): Promise<GovernedRulesEvaluationStageResult | null> {
  const envelope = await getMedicalCopilotGovernedRulesEvaluationStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedRulesEvaluationStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedRulesEvaluationStageReadAdapter = { getGovernedRulesEvaluationStage: typeof getGovernedRulesEvaluationStage };
export const governedRulesEvaluationStageReadAdapter: GovernedRulesEvaluationStageReadAdapter = { getGovernedRulesEvaluationStage };
