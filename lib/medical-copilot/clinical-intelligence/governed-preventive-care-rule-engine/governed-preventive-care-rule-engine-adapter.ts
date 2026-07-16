import { getMedicalCopilotGovernedPreventiveCareRuleEngine } from "../../api";
import { mapGovernedPreventiveCareRuleEngineEnvelope } from "./governed-preventive-care-rule-engine-mapper";
import type { GovernedPreventiveCareRuleEngineResult } from "./governed-preventive-care-rule-engine";
export async function getGovernedPreventiveCareRuleEngine(sessionId: string): Promise<GovernedPreventiveCareRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPreventiveCareRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPreventiveCareRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedPreventiveCareRuleEngineReadAdapter = { getGovernedPreventiveCareRuleEngine: typeof getGovernedPreventiveCareRuleEngine };
export const governedPreventiveCareRuleEngineReadAdapter: GovernedPreventiveCareRuleEngineReadAdapter = { getGovernedPreventiveCareRuleEngine };
