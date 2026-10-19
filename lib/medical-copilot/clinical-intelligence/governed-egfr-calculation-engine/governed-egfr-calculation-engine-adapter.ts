import { getMedicalCopilotGovernedEgfrCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedEgfrCalculationEngineEnvelope } from "./governed-egfr-calculation-engine-mapper";
import type { GovernedEgfrCalculationEngineResult } from "./governed-egfr-calculation-engine";
export type GovernedEgfrCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedEgfrCalculationEngineResult | null> };
export async function getGovernedEgfrCalculationEngine(sessionId: string): Promise<GovernedEgfrCalculationEngineResult | null> {
  return mapGovernedEgfrCalculationEngineEnvelope(await getMedicalCopilotGovernedEgfrCalculationEngine(sessionId));
}
export const governedEgfrCalculationEngineReadAdapter: GovernedEgfrCalculationEngineReadAdapter = { get: getGovernedEgfrCalculationEngine };
