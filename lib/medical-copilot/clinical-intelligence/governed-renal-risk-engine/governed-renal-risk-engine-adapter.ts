import { getMedicalCopilotGovernedRenalRiskEngine } from "../../api";
import { mapGovernedRenalRiskEngineEnvelope } from "./governed-renal-risk-engine-mapper";
import type { GovernedRenalRiskEngineResult } from "./governed-renal-risk-engine";
export async function getGovernedRenalRiskEngine(sessionId: string): Promise<GovernedRenalRiskEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedRenalRiskEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedRenalRiskEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedRenalRiskEngineReadAdapter = { getGovernedRenalRiskEngine: typeof getGovernedRenalRiskEngine };
export const governedRenalRiskEngineReadAdapter: GovernedRenalRiskEngineReadAdapter = { getGovernedRenalRiskEngine };
