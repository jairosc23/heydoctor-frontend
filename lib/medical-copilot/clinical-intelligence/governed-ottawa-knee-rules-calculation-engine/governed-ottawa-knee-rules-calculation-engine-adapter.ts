import { getMedicalCopilotGovernedOttawaKneeRulesCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedOttawaKneeRulesCalculationEngineEnvelope } from "./governed-ottawa-knee-rules-calculation-engine-mapper";
import type { GovernedOttawaKneeRulesCalculationEngineResult } from "./governed-ottawa-knee-rules-calculation-engine";
export type GovernedOttawaKneeRulesCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedOttawaKneeRulesCalculationEngineResult | null> };
export async function getGovernedOttawaKneeRulesCalculationEngine(sessionId: string): Promise<GovernedOttawaKneeRulesCalculationEngineResult | null> {
  return mapGovernedOttawaKneeRulesCalculationEngineEnvelope(await getMedicalCopilotGovernedOttawaKneeRulesCalculationEngine(sessionId));
}
export const governedOttawaKneeRulesCalculationEngineReadAdapter: GovernedOttawaKneeRulesCalculationEngineReadAdapter = { get: getGovernedOttawaKneeRulesCalculationEngine };
