import { getMedicalCopilotGovernedPopulationScreeningPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationScreeningPopulationEngineEnvelope } from "./governed-population-screening-population-engine-mapper";
import type { GovernedPopulationScreeningPopulationEngineResult } from "./governed-population-screening-population-engine";
export type GovernedPopulationScreeningPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationScreeningPopulationEngineResult | null> };
export async function getGovernedPopulationScreeningPopulationEngine(sessionId: string): Promise<GovernedPopulationScreeningPopulationEngineResult | null> { return mapGovernedPopulationScreeningPopulationEngineEnvelope(await getMedicalCopilotGovernedPopulationScreeningPopulationEngine(sessionId)); }
export const governedPopulationScreeningPopulationEngineReadAdapter: GovernedPopulationScreeningPopulationEngineReadAdapter = { get: getGovernedPopulationScreeningPopulationEngine };
