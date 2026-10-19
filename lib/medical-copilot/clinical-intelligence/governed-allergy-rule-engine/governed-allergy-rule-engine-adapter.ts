import { getMedicalCopilotGovernedAllergyRuleEngine } from "../../api";
import { mapGovernedAllergyRuleEngineEnvelope } from "./governed-allergy-rule-engine-mapper";
import type { GovernedAllergyRuleEngineResult } from "./governed-allergy-rule-engine";
export async function getGovernedAllergyRuleEngine(sessionId: string): Promise<GovernedAllergyRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedAllergyRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedAllergyRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedAllergyRuleEngineReadAdapter = { getGovernedAllergyRuleEngine: typeof getGovernedAllergyRuleEngine };
export const governedAllergyRuleEngineReadAdapter: GovernedAllergyRuleEngineReadAdapter = { getGovernedAllergyRuleEngine };
