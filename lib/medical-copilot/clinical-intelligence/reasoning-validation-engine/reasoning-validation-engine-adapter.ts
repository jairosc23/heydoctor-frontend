import { getMedicalCopilotReasoningValidationEngine } from "../../api";
import { mapReasoningValidationEngineEnvelope } from "./reasoning-validation-engine-mapper";
import type { ReasoningValidationEngineBuilderResult } from "./reasoning-validation-engine";
export async function getReasoningValidationEngine(sessionId: string): Promise<ReasoningValidationEngineBuilderResult | null> {
  const envelope = await getMedicalCopilotReasoningValidationEngine(sessionId);
  return mapReasoningValidationEngineEnvelope(envelope.data ?? envelope);
}
export type ReasoningValidationEngineReadAdapter = { getReasoningValidationEngine: typeof getReasoningValidationEngine };
export const reasoningValidationEngineReadAdapter: ReasoningValidationEngineReadAdapter = { getReasoningValidationEngine };
