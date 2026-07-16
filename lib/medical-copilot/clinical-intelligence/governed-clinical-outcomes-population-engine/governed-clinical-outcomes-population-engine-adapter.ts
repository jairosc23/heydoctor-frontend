import { getMedicalCopilotGovernedClinicalOutcomesPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalOutcomesPopulationEngineEnvelope } from "./governed-clinical-outcomes-population-engine-mapper";
import type { GovernedClinicalOutcomesPopulationEngineResult } from "./governed-clinical-outcomes-population-engine";
export type GovernedClinicalOutcomesPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalOutcomesPopulationEngineResult | null> };
export async function getGovernedClinicalOutcomesPopulationEngine(sessionId: string): Promise<GovernedClinicalOutcomesPopulationEngineResult | null> { return mapGovernedClinicalOutcomesPopulationEngineEnvelope(await getMedicalCopilotGovernedClinicalOutcomesPopulationEngine(sessionId)); }
export const governedClinicalOutcomesPopulationEngineReadAdapter: GovernedClinicalOutcomesPopulationEngineReadAdapter = { get: getGovernedClinicalOutcomesPopulationEngine };
