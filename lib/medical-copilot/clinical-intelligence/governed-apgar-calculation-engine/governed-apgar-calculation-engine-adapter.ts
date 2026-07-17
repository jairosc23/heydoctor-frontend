import { getMedicalCopilotGovernedApgarCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedApgarCalculationEngineEnvelope } from "./governed-apgar-calculation-engine-mapper";
import type { GovernedApgarCalculationEngineResult } from "./governed-apgar-calculation-engine";
export type GovernedApgarCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedApgarCalculationEngineResult | null> };
export async function getGovernedApgarCalculationEngine(sessionId: string): Promise<GovernedApgarCalculationEngineResult | null> {
  return mapGovernedApgarCalculationEngineEnvelope(await getMedicalCopilotGovernedApgarCalculationEngine(sessionId));
}
export const governedApgarCalculationEngineReadAdapter: GovernedApgarCalculationEngineReadAdapter = { get: getGovernedApgarCalculationEngine };
