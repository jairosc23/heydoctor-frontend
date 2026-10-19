import { getMedicalCopilotGovernedFollowUpOptimizationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedFollowUpOptimizationTherapeuticEngineEnvelope } from "./governed-follow-up-optimization-therapeutic-engine-mapper";
import type { GovernedFollowUpOptimizationTherapeuticEngineResult } from "./governed-follow-up-optimization-therapeutic-engine";
export type GovernedFollowUpOptimizationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedFollowUpOptimizationTherapeuticEngineResult | null> };
export async function getGovernedFollowUpOptimizationTherapeuticEngine(sessionId: string): Promise<GovernedFollowUpOptimizationTherapeuticEngineResult | null> { return mapGovernedFollowUpOptimizationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedFollowUpOptimizationTherapeuticEngine(sessionId)); }
export const governedFollowUpOptimizationTherapeuticEngineReadAdapter: GovernedFollowUpOptimizationTherapeuticEngineReadAdapter = { get: getGovernedFollowUpOptimizationTherapeuticEngine };
