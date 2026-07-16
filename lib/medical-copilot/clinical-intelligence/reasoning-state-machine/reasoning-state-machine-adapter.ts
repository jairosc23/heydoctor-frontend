import { getMedicalCopilotReasoningStateMachine } from "../../api";
import { mapReasoningStateMachineEnvelope } from "./reasoning-state-machine-mapper";
import type { ReasoningStateMachineBuilderResult } from "./reasoning-state-machine";
export async function getReasoningStateMachine(sessionId: string): Promise<ReasoningStateMachineBuilderResult | null> {
  const envelope = await getMedicalCopilotReasoningStateMachine(sessionId);
  return mapReasoningStateMachineEnvelope(envelope.data ?? envelope);
}
export type ReasoningStateMachineReadAdapter = { getReasoningStateMachine: typeof getReasoningStateMachine };
export const reasoningStateMachineReadAdapter: ReasoningStateMachineReadAdapter = { getReasoningStateMachine };
