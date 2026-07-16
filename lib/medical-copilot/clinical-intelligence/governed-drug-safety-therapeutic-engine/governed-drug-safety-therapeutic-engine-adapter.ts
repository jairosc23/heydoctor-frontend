import { getMedicalCopilotGovernedDrugSafetyTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDrugSafetyTherapeuticEngineEnvelope } from "./governed-drug-safety-therapeutic-engine-mapper";
import type { GovernedDrugSafetyTherapeuticEngineResult } from "./governed-drug-safety-therapeutic-engine";
export type GovernedDrugSafetyTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDrugSafetyTherapeuticEngineResult | null> };
export async function getGovernedDrugSafetyTherapeuticEngine(sessionId: string): Promise<GovernedDrugSafetyTherapeuticEngineResult | null> { return mapGovernedDrugSafetyTherapeuticEngineEnvelope(await getMedicalCopilotGovernedDrugSafetyTherapeuticEngine(sessionId)); }
export const governedDrugSafetyTherapeuticEngineReadAdapter: GovernedDrugSafetyTherapeuticEngineReadAdapter = { get: getGovernedDrugSafetyTherapeuticEngine };
