import { getMedicalCopilotGovernedHeartScoreCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedHeartScoreCalculationEngineEnvelope } from "./governed-heart-score-calculation-engine-mapper";
import type { GovernedHeartScoreCalculationEngineResult } from "./governed-heart-score-calculation-engine";
export type GovernedHeartScoreCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedHeartScoreCalculationEngineResult | null> };
export async function getGovernedHeartScoreCalculationEngine(sessionId: string): Promise<GovernedHeartScoreCalculationEngineResult | null> {
  return mapGovernedHeartScoreCalculationEngineEnvelope(await getMedicalCopilotGovernedHeartScoreCalculationEngine(sessionId));
}
export const governedHeartScoreCalculationEngineReadAdapter: GovernedHeartScoreCalculationEngineReadAdapter = { get: getGovernedHeartScoreCalculationEngine };
