import { getMedicalCopilotGovernedNafldScoreCalculationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedNafldScoreCalculationEngineEnvelope } from "./governed-nafld-score-calculation-engine-mapper";
import type { GovernedNafldScoreCalculationEngineResult } from "./governed-nafld-score-calculation-engine";
export type GovernedNafldScoreCalculationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedNafldScoreCalculationEngineResult | null> };
export async function getGovernedNafldScoreCalculationEngine(sessionId: string): Promise<GovernedNafldScoreCalculationEngineResult | null> {
  return mapGovernedNafldScoreCalculationEngineEnvelope(await getMedicalCopilotGovernedNafldScoreCalculationEngine(sessionId));
}
export const governedNafldScoreCalculationEngineReadAdapter: GovernedNafldScoreCalculationEngineReadAdapter = { get: getGovernedNafldScoreCalculationEngine };
