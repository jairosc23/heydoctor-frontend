import { getMedicalCopilotGovernedNihssCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedNihssCalculationEngineEnvelope } from "./governed-nihss-calculation-engine-mapper";
import type { GovernedNihssCalculationEngineResult } from "./governed-nihss-calculation-engine";
export type GovernedNihssCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedNihssCalculationEngineResult | null> };
export async function getGovernedNihssCalculationEngine(sessionId: string): Promise<GovernedNihssCalculationEngineResult | null> {
  return mapGovernedNihssCalculationEngineEnvelope(await getMedicalCopilotGovernedNihssCalculationEngine(sessionId));
}
export const governedNihssCalculationEngineReadAdapter: GovernedNihssCalculationEngineReadAdapter = { get: getGovernedNihssCalculationEngine };
