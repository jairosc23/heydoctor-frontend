import { getMedicalCopilotGovernedOttawaAnkleRulesCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedOttawaAnkleRulesCalculationEngineEnvelope } from "./governed-ottawa-ankle-rules-calculation-engine-mapper";
import type { GovernedOttawaAnkleRulesCalculationEngineResult } from "./governed-ottawa-ankle-rules-calculation-engine";
export type GovernedOttawaAnkleRulesCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedOttawaAnkleRulesCalculationEngineResult | null> };
export async function getGovernedOttawaAnkleRulesCalculationEngine(sessionId: string): Promise<GovernedOttawaAnkleRulesCalculationEngineResult | null> {
  return mapGovernedOttawaAnkleRulesCalculationEngineEnvelope(await getMedicalCopilotGovernedOttawaAnkleRulesCalculationEngine(sessionId));
}
export const governedOttawaAnkleRulesCalculationEngineReadAdapter: GovernedOttawaAnkleRulesCalculationEngineReadAdapter = { get: getGovernedOttawaAnkleRulesCalculationEngine };
