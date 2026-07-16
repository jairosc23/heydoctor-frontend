import { getMedicalCopilotGovernedRiskStratificationPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRiskStratificationPopulationEngineEnvelope } from "./governed-risk-stratification-population-engine-mapper";
import type { GovernedRiskStratificationPopulationEngineResult } from "./governed-risk-stratification-population-engine";
export type GovernedRiskStratificationPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedRiskStratificationPopulationEngineResult | null> };
export async function getGovernedRiskStratificationPopulationEngine(sessionId: string): Promise<GovernedRiskStratificationPopulationEngineResult | null> { return mapGovernedRiskStratificationPopulationEngineEnvelope(await getMedicalCopilotGovernedRiskStratificationPopulationEngine(sessionId)); }
export const governedRiskStratificationPopulationEngineReadAdapter: GovernedRiskStratificationPopulationEngineReadAdapter = { get: getGovernedRiskStratificationPopulationEngine };
