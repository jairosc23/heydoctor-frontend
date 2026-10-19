import { getMedicalCopilotGovernedQsofaCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedQsofaCalculationEngineEnvelope } from "./governed-qsofa-calculation-engine-mapper";
import type { GovernedQsofaCalculationEngineResult } from "./governed-qsofa-calculation-engine";
export type GovernedQsofaCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedQsofaCalculationEngineResult | null> };
export async function getGovernedQsofaCalculationEngine(sessionId: string): Promise<GovernedQsofaCalculationEngineResult | null> {
  return mapGovernedQsofaCalculationEngineEnvelope(await getMedicalCopilotGovernedQsofaCalculationEngine(sessionId));
}
export const governedQsofaCalculationEngineReadAdapter: GovernedQsofaCalculationEngineReadAdapter = { get: getGovernedQsofaCalculationEngine };
