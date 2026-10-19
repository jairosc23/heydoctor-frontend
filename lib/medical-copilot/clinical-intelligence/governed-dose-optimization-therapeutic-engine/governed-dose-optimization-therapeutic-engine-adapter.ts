import { getMedicalCopilotGovernedDoseOptimizationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDoseOptimizationTherapeuticEngineEnvelope } from "./governed-dose-optimization-therapeutic-engine-mapper";
import type { GovernedDoseOptimizationTherapeuticEngineResult } from "./governed-dose-optimization-therapeutic-engine";
export type GovernedDoseOptimizationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDoseOptimizationTherapeuticEngineResult | null> };
export async function getGovernedDoseOptimizationTherapeuticEngine(sessionId: string): Promise<GovernedDoseOptimizationTherapeuticEngineResult | null> { return mapGovernedDoseOptimizationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedDoseOptimizationTherapeuticEngine(sessionId)); }
export const governedDoseOptimizationTherapeuticEngineReadAdapter: GovernedDoseOptimizationTherapeuticEngineReadAdapter = { get: getGovernedDoseOptimizationTherapeuticEngine };
