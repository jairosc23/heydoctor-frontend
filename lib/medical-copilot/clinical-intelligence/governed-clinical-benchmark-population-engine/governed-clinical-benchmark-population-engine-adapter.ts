import { getMedicalCopilotGovernedClinicalBenchmarkPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalBenchmarkPopulationEngineEnvelope } from "./governed-clinical-benchmark-population-engine-mapper";
import type { GovernedClinicalBenchmarkPopulationEngineResult } from "./governed-clinical-benchmark-population-engine";
export type GovernedClinicalBenchmarkPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalBenchmarkPopulationEngineResult | null> };
export async function getGovernedClinicalBenchmarkPopulationEngine(sessionId: string): Promise<GovernedClinicalBenchmarkPopulationEngineResult | null> { return mapGovernedClinicalBenchmarkPopulationEngineEnvelope(await getMedicalCopilotGovernedClinicalBenchmarkPopulationEngine(sessionId)); }
export const governedClinicalBenchmarkPopulationEngineReadAdapter: GovernedClinicalBenchmarkPopulationEngineReadAdapter = { get: getGovernedClinicalBenchmarkPopulationEngine };
