import { getMedicalCopilotGovernedContraindicationRuleEngine } from "../../api";
import { mapGovernedContraindicationRuleEngineEnvelope } from "./governed-contraindication-rule-engine-mapper";
import type { GovernedContraindicationRuleEngineResult } from "./governed-contraindication-rule-engine";
export async function getGovernedContraindicationRuleEngine(sessionId: string): Promise<GovernedContraindicationRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedContraindicationRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedContraindicationRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedContraindicationRuleEngineReadAdapter = { getGovernedContraindicationRuleEngine: typeof getGovernedContraindicationRuleEngine };
export const governedContraindicationRuleEngineReadAdapter: GovernedContraindicationRuleEngineReadAdapter = { getGovernedContraindicationRuleEngine };
