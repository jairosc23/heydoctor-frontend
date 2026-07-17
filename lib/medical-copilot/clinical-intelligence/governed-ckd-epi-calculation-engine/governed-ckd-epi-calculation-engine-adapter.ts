import { getMedicalCopilotGovernedCkdEpiCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCkdEpiCalculationEngineEnvelope } from "./governed-ckd-epi-calculation-engine-mapper";
import type { GovernedCkdEpiCalculationEngineResult } from "./governed-ckd-epi-calculation-engine";
export type GovernedCkdEpiCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCkdEpiCalculationEngineResult | null> };
export async function getGovernedCkdEpiCalculationEngine(sessionId: string): Promise<GovernedCkdEpiCalculationEngineResult | null> {
  return mapGovernedCkdEpiCalculationEngineEnvelope(await getMedicalCopilotGovernedCkdEpiCalculationEngine(sessionId));
}
export const governedCkdEpiCalculationEngineReadAdapter: GovernedCkdEpiCalculationEngineReadAdapter = { get: getGovernedCkdEpiCalculationEngine };
