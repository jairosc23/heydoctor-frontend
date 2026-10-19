import { getMedicalCopilotGovernedVaccinationCoveragePopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedVaccinationCoveragePopulationEngineEnvelope } from "./governed-vaccination-coverage-population-engine-mapper";
import type { GovernedVaccinationCoveragePopulationEngineResult } from "./governed-vaccination-coverage-population-engine";
export type GovernedVaccinationCoveragePopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedVaccinationCoveragePopulationEngineResult | null> };
export async function getGovernedVaccinationCoveragePopulationEngine(sessionId: string): Promise<GovernedVaccinationCoveragePopulationEngineResult | null> { return mapGovernedVaccinationCoveragePopulationEngineEnvelope(await getMedicalCopilotGovernedVaccinationCoveragePopulationEngine(sessionId)); }
export const governedVaccinationCoveragePopulationEngineReadAdapter: GovernedVaccinationCoveragePopulationEngineReadAdapter = { get: getGovernedVaccinationCoveragePopulationEngine };
