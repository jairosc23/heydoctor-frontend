import { getMedicalCopilotGovernedClinicalKpisPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalKpisPopulationEngineEnvelope } from "./governed-clinical-kpis-population-engine-mapper";
import type { GovernedClinicalKpisPopulationEngineResult } from "./governed-clinical-kpis-population-engine";
export type GovernedClinicalKpisPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalKpisPopulationEngineResult | null> };
export async function getGovernedClinicalKpisPopulationEngine(sessionId: string): Promise<GovernedClinicalKpisPopulationEngineResult | null> { return mapGovernedClinicalKpisPopulationEngineEnvelope(await getMedicalCopilotGovernedClinicalKpisPopulationEngine(sessionId)); }
export const governedClinicalKpisPopulationEngineReadAdapter: GovernedClinicalKpisPopulationEngineReadAdapter = { get: getGovernedClinicalKpisPopulationEngine };
