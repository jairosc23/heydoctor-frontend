import { getMedicalCopilotGovernedClinicalReasoningSession } from "../../api";
import { mapGovernedClinicalReasoningSessionEnvelope } from "./governed-clinical-reasoning-session-mapper";
import type { GovernedClinicalReasoningSessionBuilderResult } from "./governed-clinical-reasoning-session";
export async function getGovernedClinicalReasoningSession(sessionId: string): Promise<GovernedClinicalReasoningSessionBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalReasoningSession(sessionId);
  return mapGovernedClinicalReasoningSessionEnvelope(envelope.data ?? envelope);
}
export type GovernedClinicalReasoningSessionReadAdapter = { getGovernedClinicalReasoningSession: typeof getGovernedClinicalReasoningSession };
export const governedClinicalReasoningSessionReadAdapter: GovernedClinicalReasoningSessionReadAdapter = { getGovernedClinicalReasoningSession };
