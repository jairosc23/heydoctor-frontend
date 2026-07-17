import { getMedicalCopilotReasoningQualityEngine } from "../../api";
import { mapReasoningQualityEngineEnvelope } from "./reasoning-quality-engine-mapper";
import type { ReasoningQualityEngineBuilderResult } from "./reasoning-quality-engine";
export async function getReasoningQualityEngine(sessionId: string): Promise<ReasoningQualityEngineBuilderResult | null> {
  const envelope = await getMedicalCopilotReasoningQualityEngine(sessionId);
  return mapReasoningQualityEngineEnvelope(envelope.data ?? envelope);
}
export type ReasoningQualityEngineReadAdapter = { getReasoningQualityEngine: typeof getReasoningQualityEngine };
export const reasoningQualityEngineReadAdapter: ReasoningQualityEngineReadAdapter = { getReasoningQualityEngine };
