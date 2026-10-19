import { getMedicalCopilotGovernedPreventiveOpportunitiesPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPreventiveOpportunitiesPopulationEngineEnvelope } from "./governed-preventive-opportunities-population-engine-mapper";
import type { GovernedPreventiveOpportunitiesPopulationEngineResult } from "./governed-preventive-opportunities-population-engine";
export type GovernedPreventiveOpportunitiesPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPreventiveOpportunitiesPopulationEngineResult | null> };
export async function getGovernedPreventiveOpportunitiesPopulationEngine(sessionId: string): Promise<GovernedPreventiveOpportunitiesPopulationEngineResult | null> { return mapGovernedPreventiveOpportunitiesPopulationEngineEnvelope(await getMedicalCopilotGovernedPreventiveOpportunitiesPopulationEngine(sessionId)); }
export const governedPreventiveOpportunitiesPopulationEngineReadAdapter: GovernedPreventiveOpportunitiesPopulationEngineReadAdapter = { get: getGovernedPreventiveOpportunitiesPopulationEngine };
