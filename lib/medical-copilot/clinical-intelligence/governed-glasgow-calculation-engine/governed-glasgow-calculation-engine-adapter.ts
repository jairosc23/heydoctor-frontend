import { getMedicalCopilotGovernedGlasgowCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedGlasgowCalculationEngineEnvelope } from "./governed-glasgow-calculation-engine-mapper";
import type { GovernedGlasgowCalculationEngineResult } from "./governed-glasgow-calculation-engine";
export type GovernedGlasgowCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedGlasgowCalculationEngineResult | null> };
export async function getGovernedGlasgowCalculationEngine(sessionId: string): Promise<GovernedGlasgowCalculationEngineResult | null> {
  return mapGovernedGlasgowCalculationEngineEnvelope(await getMedicalCopilotGovernedGlasgowCalculationEngine(sessionId));
}
export const governedGlasgowCalculationEngineReadAdapter: GovernedGlasgowCalculationEngineReadAdapter = { get: getGovernedGlasgowCalculationEngine };
