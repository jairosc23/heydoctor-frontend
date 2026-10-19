import { getMedicalCopilotReasoningExecutionContext } from "../../api";
import { mapReasoningExecutionContextEnvelope } from "./reasoning-execution-context-mapper";
import type { ReasoningExecutionContextBuilderResult } from "./reasoning-execution-context";
export async function getReasoningExecutionContext(sessionId: string): Promise<ReasoningExecutionContextBuilderResult | null> {
  const envelope = await getMedicalCopilotReasoningExecutionContext(sessionId);
  return mapReasoningExecutionContextEnvelope(envelope.data ?? envelope);
}
export type ReasoningExecutionContextReadAdapter = { getReasoningExecutionContext: typeof getReasoningExecutionContext };
export const reasoningExecutionContextReadAdapter: ReasoningExecutionContextReadAdapter = { getReasoningExecutionContext };
