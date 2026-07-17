import { getMedicalCopilotGovernedDrugInteractionRuleEngine } from "../../api";
import { mapGovernedDrugInteractionRuleEngineEnvelope } from "./governed-drug-interaction-rule-engine-mapper";
import type { GovernedDrugInteractionRuleEngineResult } from "./governed-drug-interaction-rule-engine";
export async function getGovernedDrugInteractionRuleEngine(sessionId: string): Promise<GovernedDrugInteractionRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDrugInteractionRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedDrugInteractionRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedDrugInteractionRuleEngineReadAdapter = { getGovernedDrugInteractionRuleEngine: typeof getGovernedDrugInteractionRuleEngine };
export const governedDrugInteractionRuleEngineReadAdapter: GovernedDrugInteractionRuleEngineReadAdapter = { getGovernedDrugInteractionRuleEngine };
