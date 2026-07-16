import { getMedicalCopilotGovernedBmiCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedBmiCalculationEngineEnvelope } from "./governed-bmi-calculation-engine-mapper";
import type { GovernedBmiCalculationEngineResult } from "./governed-bmi-calculation-engine";
export type GovernedBmiCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedBmiCalculationEngineResult | null> };
export async function getGovernedBmiCalculationEngine(sessionId: string): Promise<GovernedBmiCalculationEngineResult | null> {
  return mapGovernedBmiCalculationEngineEnvelope(await getMedicalCopilotGovernedBmiCalculationEngine(sessionId));
}
export const governedBmiCalculationEngineReadAdapter: GovernedBmiCalculationEngineReadAdapter = { get: getGovernedBmiCalculationEngine };
