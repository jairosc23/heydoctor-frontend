import { getMedicalCopilotGovernedReasoningSession } from "../../api";
import { mapGovernedReasoningSessionEnvelope } from "./governed-reasoning-session-mapper";
import type { GovernedReasoningSessionBuilderResult } from "./governed-reasoning-session";
export async function getGovernedReasoningSession(sessionId: string): Promise<GovernedReasoningSessionBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedReasoningSession(sessionId);
  return mapGovernedReasoningSessionEnvelope(envelope.data ?? envelope);
}
export type GovernedReasoningSessionReadAdapter = { getGovernedReasoningSession: typeof getGovernedReasoningSession };
export const governedReasoningSessionReadAdapter: GovernedReasoningSessionReadAdapter = { getGovernedReasoningSession };
