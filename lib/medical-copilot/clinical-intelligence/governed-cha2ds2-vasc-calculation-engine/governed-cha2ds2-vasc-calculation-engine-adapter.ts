import { getMedicalCopilotGovernedCha2ds2VascCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCha2ds2VascCalculationEngineEnvelope } from "./governed-cha2ds2-vasc-calculation-engine-mapper";
import type { GovernedCha2ds2VascCalculationEngineResult } from "./governed-cha2ds2-vasc-calculation-engine";
export type GovernedCha2ds2VascCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCha2ds2VascCalculationEngineResult | null> };
export async function getGovernedCha2ds2VascCalculationEngine(sessionId: string): Promise<GovernedCha2ds2VascCalculationEngineResult | null> {
  return mapGovernedCha2ds2VascCalculationEngineEnvelope(await getMedicalCopilotGovernedCha2ds2VascCalculationEngine(sessionId));
}
export const governedCha2ds2VascCalculationEngineReadAdapter: GovernedCha2ds2VascCalculationEngineReadAdapter = { get: getGovernedCha2ds2VascCalculationEngine };
