import { getMedicalCopilotGovernedCarePathwayOptimizationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCarePathwayOptimizationTherapeuticEngineEnvelope } from "./governed-care-pathway-optimization-therapeutic-engine-mapper";
import type { GovernedCarePathwayOptimizationTherapeuticEngineResult } from "./governed-care-pathway-optimization-therapeutic-engine";
export type GovernedCarePathwayOptimizationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCarePathwayOptimizationTherapeuticEngineResult | null> };
export async function getGovernedCarePathwayOptimizationTherapeuticEngine(sessionId: string): Promise<GovernedCarePathwayOptimizationTherapeuticEngineResult | null> { return mapGovernedCarePathwayOptimizationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedCarePathwayOptimizationTherapeuticEngine(sessionId)); }
export const governedCarePathwayOptimizationTherapeuticEngineReadAdapter: GovernedCarePathwayOptimizationTherapeuticEngineReadAdapter = { get: getGovernedCarePathwayOptimizationTherapeuticEngine };
