import { getMedicalCopilotGovernedDecisionSupportStage } from "../../api";
import { mapGovernedDecisionSupportStageEnvelope } from "./governed-decision-support-stage-mapper";
import type { GovernedDecisionSupportStageResult } from "./governed-decision-support-stage";
export async function getGovernedDecisionSupportStage(sessionId: string): Promise<GovernedDecisionSupportStageResult | null> {
  const envelope = await getMedicalCopilotGovernedDecisionSupportStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedDecisionSupportStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedDecisionSupportStageReadAdapter = { getGovernedDecisionSupportStage: typeof getGovernedDecisionSupportStage };
export const governedDecisionSupportStageReadAdapter: GovernedDecisionSupportStageReadAdapter = { getGovernedDecisionSupportStage };
