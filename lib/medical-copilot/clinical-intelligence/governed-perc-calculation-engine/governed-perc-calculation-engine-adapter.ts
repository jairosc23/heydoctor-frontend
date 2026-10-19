import { getMedicalCopilotGovernedPercCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPercCalculationEngineEnvelope } from "./governed-perc-calculation-engine-mapper";
import type { GovernedPercCalculationEngineResult } from "./governed-perc-calculation-engine";
export type GovernedPercCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPercCalculationEngineResult | null> };
export async function getGovernedPercCalculationEngine(sessionId: string): Promise<GovernedPercCalculationEngineResult | null> {
  return mapGovernedPercCalculationEngineEnvelope(await getMedicalCopilotGovernedPercCalculationEngine(sessionId));
}
export const governedPercCalculationEngineReadAdapter: GovernedPercCalculationEngineReadAdapter = { get: getGovernedPercCalculationEngine };
