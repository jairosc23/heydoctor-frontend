import { getMedicalCopilotReasoningRulePipeline } from "../../api";
import { mapReasoningRulePipelineEnvelope } from "./reasoning-rule-pipeline-mapper";
import type { ReasoningRulePipelineBuilderResult } from "./reasoning-rule-pipeline";
export async function getReasoningRulePipeline(sessionId: string): Promise<ReasoningRulePipelineBuilderResult | null> {
  const envelope = await getMedicalCopilotReasoningRulePipeline(sessionId);
  return mapReasoningRulePipelineEnvelope(envelope.data ?? envelope);
}
export type ReasoningRulePipelineReadAdapter = { getReasoningRulePipeline: typeof getReasoningRulePipeline };
export const reasoningRulePipelineReadAdapter: ReasoningRulePipelineReadAdapter = { getReasoningRulePipeline };
