import { getMedicalCopilotGovernedAdherenceAnalysisTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedAdherenceAnalysisTherapeuticEngineEnvelope } from "./governed-adherence-analysis-therapeutic-engine-mapper";
import type { GovernedAdherenceAnalysisTherapeuticEngineResult } from "./governed-adherence-analysis-therapeutic-engine";
export type GovernedAdherenceAnalysisTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedAdherenceAnalysisTherapeuticEngineResult | null> };
export async function getGovernedAdherenceAnalysisTherapeuticEngine(sessionId: string): Promise<GovernedAdherenceAnalysisTherapeuticEngineResult | null> { return mapGovernedAdherenceAnalysisTherapeuticEngineEnvelope(await getMedicalCopilotGovernedAdherenceAnalysisTherapeuticEngine(sessionId)); }
export const governedAdherenceAnalysisTherapeuticEngineReadAdapter: GovernedAdherenceAnalysisTherapeuticEngineReadAdapter = { get: getGovernedAdherenceAnalysisTherapeuticEngine };
