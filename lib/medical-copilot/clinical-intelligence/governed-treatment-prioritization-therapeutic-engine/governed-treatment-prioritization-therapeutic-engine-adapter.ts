import { getMedicalCopilotGovernedTreatmentPrioritizationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedTreatmentPrioritizationTherapeuticEngineEnvelope } from "./governed-treatment-prioritization-therapeutic-engine-mapper";
import type { GovernedTreatmentPrioritizationTherapeuticEngineResult } from "./governed-treatment-prioritization-therapeutic-engine";
export type GovernedTreatmentPrioritizationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedTreatmentPrioritizationTherapeuticEngineResult | null> };
export async function getGovernedTreatmentPrioritizationTherapeuticEngine(sessionId: string): Promise<GovernedTreatmentPrioritizationTherapeuticEngineResult | null> { return mapGovernedTreatmentPrioritizationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedTreatmentPrioritizationTherapeuticEngine(sessionId)); }
export const governedTreatmentPrioritizationTherapeuticEngineReadAdapter: GovernedTreatmentPrioritizationTherapeuticEngineReadAdapter = { get: getGovernedTreatmentPrioritizationTherapeuticEngine };
