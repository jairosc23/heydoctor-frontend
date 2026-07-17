import { getMedicalCopilotGovernedVaccinationRuleEngine } from "../../api";
import { mapGovernedVaccinationRuleEngineEnvelope } from "./governed-vaccination-rule-engine-mapper";
import type { GovernedVaccinationRuleEngineResult } from "./governed-vaccination-rule-engine";
export async function getGovernedVaccinationRuleEngine(sessionId: string): Promise<GovernedVaccinationRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedVaccinationRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedVaccinationRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedVaccinationRuleEngineReadAdapter = { getGovernedVaccinationRuleEngine: typeof getGovernedVaccinationRuleEngine };
export const governedVaccinationRuleEngineReadAdapter: GovernedVaccinationRuleEngineReadAdapter = { getGovernedVaccinationRuleEngine };
