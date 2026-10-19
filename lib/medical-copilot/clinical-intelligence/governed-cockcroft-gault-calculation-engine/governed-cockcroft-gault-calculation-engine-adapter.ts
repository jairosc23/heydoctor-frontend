import { getMedicalCopilotGovernedCockcroftGaultCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCockcroftGaultCalculationEngineEnvelope } from "./governed-cockcroft-gault-calculation-engine-mapper";
import type { GovernedCockcroftGaultCalculationEngineResult } from "./governed-cockcroft-gault-calculation-engine";
export type GovernedCockcroftGaultCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCockcroftGaultCalculationEngineResult | null> };
export async function getGovernedCockcroftGaultCalculationEngine(sessionId: string): Promise<GovernedCockcroftGaultCalculationEngineResult | null> {
  return mapGovernedCockcroftGaultCalculationEngineEnvelope(await getMedicalCopilotGovernedCockcroftGaultCalculationEngine(sessionId));
}
export const governedCockcroftGaultCalculationEngineReadAdapter: GovernedCockcroftGaultCalculationEngineReadAdapter = { get: getGovernedCockcroftGaultCalculationEngine };
