import { getMedicalCopilotGovernedClinicalAlertRuleEngine } from "../../api";
import { mapGovernedClinicalAlertRuleEngineEnvelope } from "./governed-clinical-alert-rule-engine-mapper";
import type { GovernedClinicalAlertRuleEngineResult } from "./governed-clinical-alert-rule-engine";
export async function getGovernedClinicalAlertRuleEngine(sessionId: string): Promise<GovernedClinicalAlertRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalAlertRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalAlertRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalAlertRuleEngineReadAdapter = { getGovernedClinicalAlertRuleEngine: typeof getGovernedClinicalAlertRuleEngine };
export const governedClinicalAlertRuleEngineReadAdapter: GovernedClinicalAlertRuleEngineReadAdapter = { getGovernedClinicalAlertRuleEngine };
