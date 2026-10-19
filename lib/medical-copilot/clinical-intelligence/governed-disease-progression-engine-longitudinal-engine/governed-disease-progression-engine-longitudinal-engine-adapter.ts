import { getMedicalCopilotGovernedDiseaseProgressionEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiseaseProgressionEngineLongitudinalEngineEnvelope } from "./governed-disease-progression-engine-longitudinal-engine-mapper";
import type { GovernedDiseaseProgressionEngineLongitudinalEngineResult } from "./governed-disease-progression-engine-longitudinal-engine";
export type GovernedDiseaseProgressionEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiseaseProgressionEngineLongitudinalEngineResult | null> };
export async function getGovernedDiseaseProgressionEngineLongitudinalEngine(sessionId: string): Promise<GovernedDiseaseProgressionEngineLongitudinalEngineResult | null> { return mapGovernedDiseaseProgressionEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedDiseaseProgressionEngineLongitudinalEngine(sessionId)); }
export const governedDiseaseProgressionEngineLongitudinalEngineReadAdapter: GovernedDiseaseProgressionEngineLongitudinalEngineReadAdapter = { get: getGovernedDiseaseProgressionEngineLongitudinalEngine };
