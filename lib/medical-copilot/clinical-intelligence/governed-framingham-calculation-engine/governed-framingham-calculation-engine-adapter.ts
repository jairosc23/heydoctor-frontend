import { getMedicalCopilotGovernedFraminghamCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedFraminghamCalculationEngineEnvelope } from "./governed-framingham-calculation-engine-mapper";
import type { GovernedFraminghamCalculationEngineResult } from "./governed-framingham-calculation-engine";
export type GovernedFraminghamCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedFraminghamCalculationEngineResult | null> };
export async function getGovernedFraminghamCalculationEngine(sessionId: string): Promise<GovernedFraminghamCalculationEngineResult | null> {
  return mapGovernedFraminghamCalculationEngineEnvelope(await getMedicalCopilotGovernedFraminghamCalculationEngine(sessionId));
}
export const governedFraminghamCalculationEngineReadAdapter: GovernedFraminghamCalculationEngineReadAdapter = { get: getGovernedFraminghamCalculationEngine };
