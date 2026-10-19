import { getMedicalCopilotGovernedCurb65CalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCurb65CalculationEngineEnvelope } from "./governed-curb65-calculation-engine-mapper";
import type { GovernedCurb65CalculationEngineResult } from "./governed-curb65-calculation-engine";
export type GovernedCurb65CalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCurb65CalculationEngineResult | null> };
export async function getGovernedCurb65CalculationEngine(sessionId: string): Promise<GovernedCurb65CalculationEngineResult | null> {
  return mapGovernedCurb65CalculationEngineEnvelope(await getMedicalCopilotGovernedCurb65CalculationEngine(sessionId));
}
export const governedCurb65CalculationEngineReadAdapter: GovernedCurb65CalculationEngineReadAdapter = { get: getGovernedCurb65CalculationEngine };
