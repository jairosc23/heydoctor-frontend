import { getMedicalCopilotGovernedReasoningOutput } from "../../api";
import { mapGovernedReasoningOutputEnvelope } from "./governed-reasoning-output-mapper";
import type { GovernedReasoningOutputBuilderResult } from "./governed-reasoning-output";
export async function getGovernedReasoningOutput(sessionId: string): Promise<GovernedReasoningOutputBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedReasoningOutput(sessionId);
  return mapGovernedReasoningOutputEnvelope(envelope.data ?? envelope);
}
export type GovernedReasoningOutputReadAdapter = { getGovernedReasoningOutput: typeof getGovernedReasoningOutput };
export const governedReasoningOutputReadAdapter: GovernedReasoningOutputReadAdapter = { getGovernedReasoningOutput };
