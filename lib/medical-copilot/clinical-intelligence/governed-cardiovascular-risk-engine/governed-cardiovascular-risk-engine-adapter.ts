import { getMedicalCopilotGovernedCardiovascularRiskEngine } from "../../api";
import { mapGovernedCardiovascularRiskEngineEnvelope } from "./governed-cardiovascular-risk-engine-mapper";
import type { GovernedCardiovascularRiskEngineResult } from "./governed-cardiovascular-risk-engine";
export async function getGovernedCardiovascularRiskEngine(sessionId: string): Promise<GovernedCardiovascularRiskEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedCardiovascularRiskEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedCardiovascularRiskEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedCardiovascularRiskEngineReadAdapter = { getGovernedCardiovascularRiskEngine: typeof getGovernedCardiovascularRiskEngine };
export const governedCardiovascularRiskEngineReadAdapter: GovernedCardiovascularRiskEngineReadAdapter = { getGovernedCardiovascularRiskEngine };
