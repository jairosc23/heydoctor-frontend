import { getMedicalCopilotGovernedTreatmentResponseTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedTreatmentResponseTherapeuticEngineEnvelope } from "./governed-treatment-response-therapeutic-engine-mapper";
import type { GovernedTreatmentResponseTherapeuticEngineResult } from "./governed-treatment-response-therapeutic-engine";
export type GovernedTreatmentResponseTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedTreatmentResponseTherapeuticEngineResult | null> };
export async function getGovernedTreatmentResponseTherapeuticEngine(sessionId: string): Promise<GovernedTreatmentResponseTherapeuticEngineResult | null> { return mapGovernedTreatmentResponseTherapeuticEngineEnvelope(await getMedicalCopilotGovernedTreatmentResponseTherapeuticEngine(sessionId)); }
export const governedTreatmentResponseTherapeuticEngineReadAdapter: GovernedTreatmentResponseTherapeuticEngineReadAdapter = { get: getGovernedTreatmentResponseTherapeuticEngine };
