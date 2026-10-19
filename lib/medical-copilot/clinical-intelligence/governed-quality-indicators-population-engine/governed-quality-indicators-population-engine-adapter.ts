import { getMedicalCopilotGovernedQualityIndicatorsPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedQualityIndicatorsPopulationEngineEnvelope } from "./governed-quality-indicators-population-engine-mapper";
import type { GovernedQualityIndicatorsPopulationEngineResult } from "./governed-quality-indicators-population-engine";
export type GovernedQualityIndicatorsPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedQualityIndicatorsPopulationEngineResult | null> };
export async function getGovernedQualityIndicatorsPopulationEngine(sessionId: string): Promise<GovernedQualityIndicatorsPopulationEngineResult | null> { return mapGovernedQualityIndicatorsPopulationEngineEnvelope(await getMedicalCopilotGovernedQualityIndicatorsPopulationEngine(sessionId)); }
export const governedQualityIndicatorsPopulationEngineReadAdapter: GovernedQualityIndicatorsPopulationEngineReadAdapter = { get: getGovernedQualityIndicatorsPopulationEngine };
