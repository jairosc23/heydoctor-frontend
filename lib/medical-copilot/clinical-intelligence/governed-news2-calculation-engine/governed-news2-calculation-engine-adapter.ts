import { getMedicalCopilotGovernedNews2CalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedNews2CalculationEngineEnvelope } from "./governed-news2-calculation-engine-mapper";
import type { GovernedNews2CalculationEngineResult } from "./governed-news2-calculation-engine";
export type GovernedNews2CalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedNews2CalculationEngineResult | null> };
export async function getGovernedNews2CalculationEngine(sessionId: string): Promise<GovernedNews2CalculationEngineResult | null> {
  return mapGovernedNews2CalculationEngineEnvelope(await getMedicalCopilotGovernedNews2CalculationEngine(sessionId));
}
export const governedNews2CalculationEngineReadAdapter: GovernedNews2CalculationEngineReadAdapter = { get: getGovernedNews2CalculationEngine };
