import { getMedicalCopilotGovernedTherapeuticRecommendationsTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedTherapeuticRecommendationsTherapeuticEngineEnvelope } from "./governed-therapeutic-recommendations-therapeutic-engine-mapper";
import type { GovernedTherapeuticRecommendationsTherapeuticEngineResult } from "./governed-therapeutic-recommendations-therapeutic-engine";
export type GovernedTherapeuticRecommendationsTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedTherapeuticRecommendationsTherapeuticEngineResult | null> };
export async function getGovernedTherapeuticRecommendationsTherapeuticEngine(sessionId: string): Promise<GovernedTherapeuticRecommendationsTherapeuticEngineResult | null> { return mapGovernedTherapeuticRecommendationsTherapeuticEngineEnvelope(await getMedicalCopilotGovernedTherapeuticRecommendationsTherapeuticEngine(sessionId)); }
export const governedTherapeuticRecommendationsTherapeuticEngineReadAdapter: GovernedTherapeuticRecommendationsTherapeuticEngineReadAdapter = { get: getGovernedTherapeuticRecommendationsTherapeuticEngine };
