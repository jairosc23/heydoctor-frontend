import { getMedicalCopilotGovernedResourceUtilizationPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedResourceUtilizationPopulationEngineEnvelope } from "./governed-resource-utilization-population-engine-mapper";
import type { GovernedResourceUtilizationPopulationEngineResult } from "./governed-resource-utilization-population-engine";
export type GovernedResourceUtilizationPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedResourceUtilizationPopulationEngineResult | null> };
export async function getGovernedResourceUtilizationPopulationEngine(sessionId: string): Promise<GovernedResourceUtilizationPopulationEngineResult | null> { return mapGovernedResourceUtilizationPopulationEngineEnvelope(await getMedicalCopilotGovernedResourceUtilizationPopulationEngine(sessionId)); }
export const governedResourceUtilizationPopulationEngineReadAdapter: GovernedResourceUtilizationPopulationEngineReadAdapter = { get: getGovernedResourceUtilizationPopulationEngine };
