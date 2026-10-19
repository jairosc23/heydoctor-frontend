import { getMedicalCopilotGovernedHasBledCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedHasBledCalculationEngineEnvelope } from "./governed-has-bled-calculation-engine-mapper";
import type { GovernedHasBledCalculationEngineResult } from "./governed-has-bled-calculation-engine";
export type GovernedHasBledCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedHasBledCalculationEngineResult | null> };
export async function getGovernedHasBledCalculationEngine(sessionId: string): Promise<GovernedHasBledCalculationEngineResult | null> {
  return mapGovernedHasBledCalculationEngineEnvelope(await getMedicalCopilotGovernedHasBledCalculationEngine(sessionId));
}
export const governedHasBledCalculationEngineReadAdapter: GovernedHasBledCalculationEngineReadAdapter = { get: getGovernedHasBledCalculationEngine };
