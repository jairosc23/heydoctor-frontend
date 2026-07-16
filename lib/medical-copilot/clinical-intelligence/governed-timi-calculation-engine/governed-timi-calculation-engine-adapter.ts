import { getMedicalCopilotGovernedTimiCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedTimiCalculationEngineEnvelope } from "./governed-timi-calculation-engine-mapper";
import type { GovernedTimiCalculationEngineResult } from "./governed-timi-calculation-engine";
export type GovernedTimiCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedTimiCalculationEngineResult | null> };
export async function getGovernedTimiCalculationEngine(sessionId: string): Promise<GovernedTimiCalculationEngineResult | null> {
  return mapGovernedTimiCalculationEngineEnvelope(await getMedicalCopilotGovernedTimiCalculationEngine(sessionId));
}
export const governedTimiCalculationEngineReadAdapter: GovernedTimiCalculationEngineReadAdapter = { get: getGovernedTimiCalculationEngine };
