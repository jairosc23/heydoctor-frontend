import { getMedicalCopilotGovernedChronicDiseaseRuleEngine } from "../../api";
import { mapGovernedChronicDiseaseRuleEngineEnvelope } from "./governed-chronic-disease-rule-engine-mapper";
import type { GovernedChronicDiseaseRuleEngineResult } from "./governed-chronic-disease-rule-engine";
export async function getGovernedChronicDiseaseRuleEngine(sessionId: string): Promise<GovernedChronicDiseaseRuleEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedChronicDiseaseRuleEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedChronicDiseaseRuleEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedChronicDiseaseRuleEngineReadAdapter = { getGovernedChronicDiseaseRuleEngine: typeof getGovernedChronicDiseaseRuleEngine };
export const governedChronicDiseaseRuleEngineReadAdapter: GovernedChronicDiseaseRuleEngineReadAdapter = { getGovernedChronicDiseaseRuleEngine };
