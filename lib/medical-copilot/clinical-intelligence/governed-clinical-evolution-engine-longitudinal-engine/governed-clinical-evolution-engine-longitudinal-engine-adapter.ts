import { getMedicalCopilotGovernedClinicalEvolutionEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalEvolutionEngineLongitudinalEngineEnvelope } from "./governed-clinical-evolution-engine-longitudinal-engine-mapper";
import type { GovernedClinicalEvolutionEngineLongitudinalEngineResult } from "./governed-clinical-evolution-engine-longitudinal-engine";
export type GovernedClinicalEvolutionEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalEvolutionEngineLongitudinalEngineResult | null> };
export async function getGovernedClinicalEvolutionEngineLongitudinalEngine(sessionId: string): Promise<GovernedClinicalEvolutionEngineLongitudinalEngineResult | null> { return mapGovernedClinicalEvolutionEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedClinicalEvolutionEngineLongitudinalEngine(sessionId)); }
export const governedClinicalEvolutionEngineLongitudinalEngineReadAdapter: GovernedClinicalEvolutionEngineLongitudinalEngineReadAdapter = { get: getGovernedClinicalEvolutionEngineLongitudinalEngine };
