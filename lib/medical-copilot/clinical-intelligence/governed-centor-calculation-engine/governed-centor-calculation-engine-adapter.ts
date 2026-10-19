import { getMedicalCopilotGovernedCentorCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCentorCalculationEngineEnvelope } from "./governed-centor-calculation-engine-mapper";
import type { GovernedCentorCalculationEngineResult } from "./governed-centor-calculation-engine";
export type GovernedCentorCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCentorCalculationEngineResult | null> };
export async function getGovernedCentorCalculationEngine(sessionId: string): Promise<GovernedCentorCalculationEngineResult | null> {
  return mapGovernedCentorCalculationEngineEnvelope(await getMedicalCopilotGovernedCentorCalculationEngine(sessionId));
}
export const governedCentorCalculationEngineReadAdapter: GovernedCentorCalculationEngineReadAdapter = { get: getGovernedCentorCalculationEngine };
