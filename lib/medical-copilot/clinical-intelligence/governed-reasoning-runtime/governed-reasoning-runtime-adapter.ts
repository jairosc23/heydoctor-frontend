import { getMedicalCopilotGovernedReasoningRuntime } from "../../api";
import { mapGovernedReasoningRuntimeEnvelope } from "./governed-reasoning-runtime-mapper";
import type { GovernedReasoningRuntimeBuilderResult } from "./governed-reasoning-runtime";
export async function getGovernedReasoningRuntime(sessionId: string): Promise<GovernedReasoningRuntimeBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedReasoningRuntime(sessionId);
  return mapGovernedReasoningRuntimeEnvelope(envelope.data ?? envelope);
}
export type GovernedReasoningRuntimeReadAdapter = { getGovernedReasoningRuntime: typeof getGovernedReasoningRuntime };
export const governedReasoningRuntimeReadAdapter: GovernedReasoningRuntimeReadAdapter = { getGovernedReasoningRuntime };
