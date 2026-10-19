import { getMedicalCopilotGovernedPopulationTrendsPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationTrendsPopulationEngineEnvelope } from "./governed-population-trends-population-engine-mapper";
import type { GovernedPopulationTrendsPopulationEngineResult } from "./governed-population-trends-population-engine";
export type GovernedPopulationTrendsPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationTrendsPopulationEngineResult | null> };
export async function getGovernedPopulationTrendsPopulationEngine(sessionId: string): Promise<GovernedPopulationTrendsPopulationEngineResult | null> { return mapGovernedPopulationTrendsPopulationEngineEnvelope(await getMedicalCopilotGovernedPopulationTrendsPopulationEngine(sessionId)); }
export const governedPopulationTrendsPopulationEngineReadAdapter: GovernedPopulationTrendsPopulationEngineReadAdapter = { get: getGovernedPopulationTrendsPopulationEngine };
