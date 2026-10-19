import { getMedicalCopilotGovernedPopulationGovernancePopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPopulationGovernancePopulationEngineEnvelope } from "./governed-population-governance-population-engine-mapper";
import type { GovernedPopulationGovernancePopulationEngineResult } from "./governed-population-governance-population-engine";
export type GovernedPopulationGovernancePopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPopulationGovernancePopulationEngineResult | null> };
export async function getGovernedPopulationGovernancePopulationEngine(sessionId: string): Promise<GovernedPopulationGovernancePopulationEngineResult | null> { return mapGovernedPopulationGovernancePopulationEngineEnvelope(await getMedicalCopilotGovernedPopulationGovernancePopulationEngine(sessionId)); }
export const governedPopulationGovernancePopulationEngineReadAdapter: GovernedPopulationGovernancePopulationEngineReadAdapter = { get: getGovernedPopulationGovernancePopulationEngine };
