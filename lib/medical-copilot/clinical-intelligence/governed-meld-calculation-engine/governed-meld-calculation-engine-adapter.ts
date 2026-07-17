import { getMedicalCopilotGovernedMeldCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMeldCalculationEngineEnvelope } from "./governed-meld-calculation-engine-mapper";
import type { GovernedMeldCalculationEngineResult } from "./governed-meld-calculation-engine";
export type GovernedMeldCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMeldCalculationEngineResult | null> };
export async function getGovernedMeldCalculationEngine(sessionId: string): Promise<GovernedMeldCalculationEngineResult | null> {
  return mapGovernedMeldCalculationEngineEnvelope(await getMedicalCopilotGovernedMeldCalculationEngine(sessionId));
}
export const governedMeldCalculationEngineReadAdapter: GovernedMeldCalculationEngineReadAdapter = { get: getGovernedMeldCalculationEngine };
