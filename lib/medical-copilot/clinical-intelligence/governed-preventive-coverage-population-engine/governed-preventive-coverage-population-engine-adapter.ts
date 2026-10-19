import { getMedicalCopilotGovernedPreventiveCoveragePopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPreventiveCoveragePopulationEngineEnvelope } from "./governed-preventive-coverage-population-engine-mapper";
import type { GovernedPreventiveCoveragePopulationEngineResult } from "./governed-preventive-coverage-population-engine";
export type GovernedPreventiveCoveragePopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPreventiveCoveragePopulationEngineResult | null> };
export async function getGovernedPreventiveCoveragePopulationEngine(sessionId: string): Promise<GovernedPreventiveCoveragePopulationEngineResult | null> { return mapGovernedPreventiveCoveragePopulationEngineEnvelope(await getMedicalCopilotGovernedPreventiveCoveragePopulationEngine(sessionId)); }
export const governedPreventiveCoveragePopulationEngineReadAdapter: GovernedPreventiveCoveragePopulationEngineReadAdapter = { get: getGovernedPreventiveCoveragePopulationEngine };
