import { getMedicalCopilotGovernedMedicationOptimizationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMedicationOptimizationTherapeuticEngineEnvelope } from "./governed-medication-optimization-therapeutic-engine-mapper";
import type { GovernedMedicationOptimizationTherapeuticEngineResult } from "./governed-medication-optimization-therapeutic-engine";
export type GovernedMedicationOptimizationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMedicationOptimizationTherapeuticEngineResult | null> };
export async function getGovernedMedicationOptimizationTherapeuticEngine(sessionId: string): Promise<GovernedMedicationOptimizationTherapeuticEngineResult | null> { return mapGovernedMedicationOptimizationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedMedicationOptimizationTherapeuticEngine(sessionId)); }
export const governedMedicationOptimizationTherapeuticEngineReadAdapter: GovernedMedicationOptimizationTherapeuticEngineReadAdapter = { get: getGovernedMedicationOptimizationTherapeuticEngine };
