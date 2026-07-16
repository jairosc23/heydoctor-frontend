import { getMedicalCopilotGovernedBsaCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedBsaCalculationEngineEnvelope } from "./governed-bsa-calculation-engine-mapper";
import type { GovernedBsaCalculationEngineResult } from "./governed-bsa-calculation-engine";
export type GovernedBsaCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedBsaCalculationEngineResult | null> };
export async function getGovernedBsaCalculationEngine(sessionId: string): Promise<GovernedBsaCalculationEngineResult | null> {
  return mapGovernedBsaCalculationEngineEnvelope(await getMedicalCopilotGovernedBsaCalculationEngine(sessionId));
}
export const governedBsaCalculationEngineReadAdapter: GovernedBsaCalculationEngineReadAdapter = { get: getGovernedBsaCalculationEngine };
