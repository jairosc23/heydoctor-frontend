import { getMedicalCopilotGovernedWellsPeCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedWellsPeCalculationEngineEnvelope } from "./governed-wells-pe-calculation-engine-mapper";
import type { GovernedWellsPeCalculationEngineResult } from "./governed-wells-pe-calculation-engine";
export type GovernedWellsPeCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedWellsPeCalculationEngineResult | null> };
export async function getGovernedWellsPeCalculationEngine(sessionId: string): Promise<GovernedWellsPeCalculationEngineResult | null> {
  return mapGovernedWellsPeCalculationEngineEnvelope(await getMedicalCopilotGovernedWellsPeCalculationEngine(sessionId));
}
export const governedWellsPeCalculationEngineReadAdapter: GovernedWellsPeCalculationEngineReadAdapter = { get: getGovernedWellsPeCalculationEngine };
