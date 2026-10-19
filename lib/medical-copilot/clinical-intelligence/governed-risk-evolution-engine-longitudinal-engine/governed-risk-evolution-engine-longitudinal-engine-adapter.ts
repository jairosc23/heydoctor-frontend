import { getMedicalCopilotGovernedRiskEvolutionEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRiskEvolutionEngineLongitudinalEngineEnvelope } from "./governed-risk-evolution-engine-longitudinal-engine-mapper";
import type { GovernedRiskEvolutionEngineLongitudinalEngineResult } from "./governed-risk-evolution-engine-longitudinal-engine";
export type GovernedRiskEvolutionEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedRiskEvolutionEngineLongitudinalEngineResult | null> };
export async function getGovernedRiskEvolutionEngineLongitudinalEngine(sessionId: string): Promise<GovernedRiskEvolutionEngineLongitudinalEngineResult | null> { return mapGovernedRiskEvolutionEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedRiskEvolutionEngineLongitudinalEngine(sessionId)); }
export const governedRiskEvolutionEngineLongitudinalEngineReadAdapter: GovernedRiskEvolutionEngineLongitudinalEngineReadAdapter = { get: getGovernedRiskEvolutionEngineLongitudinalEngine };
