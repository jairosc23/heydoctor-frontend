import { getMedicalCopilotGovernedCalculationValidationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCalculationValidationEngineEnvelope } from "./governed-calculation-validation-engine-mapper";
import type { GovernedCalculationValidationEngineResult } from "./governed-calculation-validation-engine";
export type GovernedCalculationValidationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCalculationValidationEngineResult | null> };
export async function getGovernedCalculationValidationEngine(sessionId: string): Promise<GovernedCalculationValidationEngineResult | null> {
  return mapGovernedCalculationValidationEngineEnvelope(await getMedicalCopilotGovernedCalculationValidationEngine(sessionId));
}
export const governedCalculationValidationEngineReadAdapter: GovernedCalculationValidationEngineReadAdapter = { get: getGovernedCalculationValidationEngine };
