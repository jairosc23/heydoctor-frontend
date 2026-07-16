import { getMedicalCopilotGovernedClinicalRiskRuleEngine } from "../../api";
import { mapGovernedClinicalRiskRuleEngineEnvelope } from "./governed-clinical-risk-rule-engine-mapper";
import type { GovernedClinicalRiskRuleEngineResult } from "./governed-clinical-risk-rule-engine";
export async function getGovernedClinicalRiskRuleEngine(sessionId: string): Promise<GovernedClinicalRiskRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalRiskRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalRiskRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalRiskRuleEngineReadAdapter = { getGovernedClinicalRiskRuleEngine: typeof getGovernedClinicalRiskRuleEngine };
export const governedClinicalRiskRuleEngineReadAdapter: GovernedClinicalRiskRuleEngineReadAdapter = { getGovernedClinicalRiskRuleEngine };
