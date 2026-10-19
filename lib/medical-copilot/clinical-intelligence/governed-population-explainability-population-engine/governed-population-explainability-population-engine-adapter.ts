import { getMedicalCopilotGovernedPopulationExplainabilityPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationExplainabilityPopulationEngineEnvelope } from "./governed-population-explainability-population-engine-mapper";
import type { GovernedPopulationExplainabilityPopulationEngineResult } from "./governed-population-explainability-population-engine";
export type GovernedPopulationExplainabilityPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationExplainabilityPopulationEngineResult | null> };
export async function getGovernedPopulationExplainabilityPopulationEngine(sessionId: string): Promise<GovernedPopulationExplainabilityPopulationEngineResult | null> { return mapGovernedPopulationExplainabilityPopulationEngineEnvelope(await getMedicalCopilotGovernedPopulationExplainabilityPopulationEngine(sessionId)); }
export const governedPopulationExplainabilityPopulationEngineReadAdapter: GovernedPopulationExplainabilityPopulationEngineReadAdapter = { get: getGovernedPopulationExplainabilityPopulationEngine };
