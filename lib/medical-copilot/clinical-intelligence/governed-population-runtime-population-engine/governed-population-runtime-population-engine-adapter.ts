import { getMedicalCopilotGovernedPopulationRuntimePopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationRuntimePopulationEngineEnvelope } from "./governed-population-runtime-population-engine-mapper";
import type { GovernedPopulationRuntimePopulationEngineResult } from "./governed-population-runtime-population-engine";
export type GovernedPopulationRuntimePopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationRuntimePopulationEngineResult | null> };
export async function getGovernedPopulationRuntimePopulationEngine(sessionId: string): Promise<GovernedPopulationRuntimePopulationEngineResult | null> { return mapGovernedPopulationRuntimePopulationEngineEnvelope(await getMedicalCopilotGovernedPopulationRuntimePopulationEngine(sessionId)); }
export const governedPopulationRuntimePopulationEngineReadAdapter: GovernedPopulationRuntimePopulationEngineReadAdapter = { get: getGovernedPopulationRuntimePopulationEngine };
