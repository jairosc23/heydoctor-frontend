import { getMedicalCopilotGovernedContinuityOfCareEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedContinuityOfCareEngineLongitudinalEngineEnvelope } from "./governed-continuity-of-care-engine-longitudinal-engine-mapper";
import type { GovernedContinuityOfCareEngineLongitudinalEngineResult } from "./governed-continuity-of-care-engine-longitudinal-engine";
export type GovernedContinuityOfCareEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedContinuityOfCareEngineLongitudinalEngineResult | null> };
export async function getGovernedContinuityOfCareEngineLongitudinalEngine(sessionId: string): Promise<GovernedContinuityOfCareEngineLongitudinalEngineResult | null> { return mapGovernedContinuityOfCareEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedContinuityOfCareEngineLongitudinalEngine(sessionId)); }
export const governedContinuityOfCareEngineLongitudinalEngineReadAdapter: GovernedContinuityOfCareEngineLongitudinalEngineReadAdapter = { get: getGovernedContinuityOfCareEngineLongitudinalEngine };
