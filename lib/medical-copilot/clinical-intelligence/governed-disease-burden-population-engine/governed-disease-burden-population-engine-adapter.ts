import { getMedicalCopilotGovernedDiseaseBurdenPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiseaseBurdenPopulationEngineEnvelope } from "./governed-disease-burden-population-engine-mapper";
import type { GovernedDiseaseBurdenPopulationEngineResult } from "./governed-disease-burden-population-engine";
export type GovernedDiseaseBurdenPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiseaseBurdenPopulationEngineResult | null> };
export async function getGovernedDiseaseBurdenPopulationEngine(sessionId: string): Promise<GovernedDiseaseBurdenPopulationEngineResult | null> { return mapGovernedDiseaseBurdenPopulationEngineEnvelope(await getMedicalCopilotGovernedDiseaseBurdenPopulationEngine(sessionId)); }
export const governedDiseaseBurdenPopulationEngineReadAdapter: GovernedDiseaseBurdenPopulationEngineReadAdapter = { get: getGovernedDiseaseBurdenPopulationEngine };
