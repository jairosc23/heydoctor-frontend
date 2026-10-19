import { getMedicalCopilotGovernedLaboratoryTrendEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedLaboratoryTrendEngineLongitudinalEngineEnvelope } from "./governed-laboratory-trend-engine-longitudinal-engine-mapper";
import type { GovernedLaboratoryTrendEngineLongitudinalEngineResult } from "./governed-laboratory-trend-engine-longitudinal-engine";
export type GovernedLaboratoryTrendEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedLaboratoryTrendEngineLongitudinalEngineResult | null> };
export async function getGovernedLaboratoryTrendEngineLongitudinalEngine(sessionId: string): Promise<GovernedLaboratoryTrendEngineLongitudinalEngineResult | null> { return mapGovernedLaboratoryTrendEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedLaboratoryTrendEngineLongitudinalEngine(sessionId)); }
export const governedLaboratoryTrendEngineLongitudinalEngineReadAdapter: GovernedLaboratoryTrendEngineLongitudinalEngineReadAdapter = { get: getGovernedLaboratoryTrendEngineLongitudinalEngine };
