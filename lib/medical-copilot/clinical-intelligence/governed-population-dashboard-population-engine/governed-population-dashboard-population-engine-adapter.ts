import { getMedicalCopilotGovernedPopulationDashboardPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationDashboardPopulationEngineEnvelope } from "./governed-population-dashboard-population-engine-mapper";
import type { GovernedPopulationDashboardPopulationEngineResult } from "./governed-population-dashboard-population-engine";
export type GovernedPopulationDashboardPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationDashboardPopulationEngineResult | null> };
export async function getGovernedPopulationDashboardPopulationEngine(sessionId: string): Promise<GovernedPopulationDashboardPopulationEngineResult | null> { return mapGovernedPopulationDashboardPopulationEngineEnvelope(await getMedicalCopilotGovernedPopulationDashboardPopulationEngine(sessionId)); }
export const governedPopulationDashboardPopulationEngineReadAdapter: GovernedPopulationDashboardPopulationEngineReadAdapter = { get: getGovernedPopulationDashboardPopulationEngine };
