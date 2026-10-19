import { getMedicalCopilotGovernedFib4CalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedFib4CalculationEngineEnvelope } from "./governed-fib4-calculation-engine-mapper";
import type { GovernedFib4CalculationEngineResult } from "./governed-fib4-calculation-engine";
export type GovernedFib4CalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedFib4CalculationEngineResult | null> };
export async function getGovernedFib4CalculationEngine(sessionId: string): Promise<GovernedFib4CalculationEngineResult | null> {
  return mapGovernedFib4CalculationEngineEnvelope(await getMedicalCopilotGovernedFib4CalculationEngine(sessionId));
}
export const governedFib4CalculationEngineReadAdapter: GovernedFib4CalculationEngineReadAdapter = { get: getGovernedFib4CalculationEngine };
