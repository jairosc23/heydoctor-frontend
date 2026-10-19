import { getMedicalCopilotGovernedAscvdCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAscvdCalculationEngineEnvelope } from "./governed-ascvd-calculation-engine-mapper";
import type { GovernedAscvdCalculationEngineResult } from "./governed-ascvd-calculation-engine";
export type GovernedAscvdCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedAscvdCalculationEngineResult | null> };
export async function getGovernedAscvdCalculationEngine(sessionId: string): Promise<GovernedAscvdCalculationEngineResult | null> {
  return mapGovernedAscvdCalculationEngineEnvelope(await getMedicalCopilotGovernedAscvdCalculationEngine(sessionId));
}
export const governedAscvdCalculationEngineReadAdapter: GovernedAscvdCalculationEngineReadAdapter = { get: getGovernedAscvdCalculationEngine };
