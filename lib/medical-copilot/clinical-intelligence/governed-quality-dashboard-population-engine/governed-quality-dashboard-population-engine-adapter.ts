import { getMedicalCopilotGovernedQualityDashboardPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedQualityDashboardPopulationEngineEnvelope } from "./governed-quality-dashboard-population-engine-mapper";
import type { GovernedQualityDashboardPopulationEngineResult } from "./governed-quality-dashboard-population-engine";
export type GovernedQualityDashboardPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedQualityDashboardPopulationEngineResult | null> };
export async function getGovernedQualityDashboardPopulationEngine(sessionId: string): Promise<GovernedQualityDashboardPopulationEngineResult | null> { return mapGovernedQualityDashboardPopulationEngineEnvelope(await getMedicalCopilotGovernedQualityDashboardPopulationEngine(sessionId)); }
export const governedQualityDashboardPopulationEngineReadAdapter: GovernedQualityDashboardPopulationEngineReadAdapter = { get: getGovernedQualityDashboardPopulationEngine };
