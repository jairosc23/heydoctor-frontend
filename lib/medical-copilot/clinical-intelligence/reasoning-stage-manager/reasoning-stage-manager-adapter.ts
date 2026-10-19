import { getMedicalCopilotReasoningStageManager } from "../../api";
import { mapReasoningStageManagerEnvelope } from "./reasoning-stage-manager-mapper";
import type { ReasoningStageManagerBuilderResult } from "./reasoning-stage-manager";
export async function getReasoningStageManager(sessionId: string): Promise<ReasoningStageManagerBuilderResult | null> {
  const envelope = await getMedicalCopilotReasoningStageManager(sessionId);
  return mapReasoningStageManagerEnvelope(envelope.data ?? envelope);
}
export type ReasoningStageManagerReadAdapter = { getReasoningStageManager: typeof getReasoningStageManager };
export const reasoningStageManagerReadAdapter: ReasoningStageManagerReadAdapter = { getReasoningStageManager };
