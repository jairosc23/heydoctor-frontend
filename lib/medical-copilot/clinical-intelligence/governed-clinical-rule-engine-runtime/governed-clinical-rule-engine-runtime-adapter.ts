import { getMedicalCopilotGovernedClinicalRuleEngineRuntime } from "../../api";
import { mapGovernedClinicalRuleEngineRuntimeEnvelope } from "./governed-clinical-rule-engine-runtime-mapper";
import type { GovernedClinicalRuleEngineRuntimeResult } from "./governed-clinical-rule-engine-runtime";
export async function getGovernedClinicalRuleEngineRuntime(sessionId: string): Promise<GovernedClinicalRuleEngineRuntimeResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalRuleEngineRuntime(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalRuleEngineRuntimeEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedClinicalRuleEngineRuntimeReadAdapter = { getGovernedClinicalRuleEngineRuntime: typeof getGovernedClinicalRuleEngineRuntime };
export const governedClinicalRuleEngineRuntimeReadAdapter: GovernedClinicalRuleEngineRuntimeReadAdapter = { getGovernedClinicalRuleEngineRuntime };
