import { getMedicalCopilotGovernedMedicationReconciliationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMedicationReconciliationTherapeuticEngineEnvelope } from "./governed-medication-reconciliation-therapeutic-engine-mapper";
import type { GovernedMedicationReconciliationTherapeuticEngineResult } from "./governed-medication-reconciliation-therapeutic-engine";
export type GovernedMedicationReconciliationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMedicationReconciliationTherapeuticEngineResult | null> };
export async function getGovernedMedicationReconciliationTherapeuticEngine(sessionId: string): Promise<GovernedMedicationReconciliationTherapeuticEngineResult | null> { return mapGovernedMedicationReconciliationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedMedicationReconciliationTherapeuticEngine(sessionId)); }
export const governedMedicationReconciliationTherapeuticEngineReadAdapter: GovernedMedicationReconciliationTherapeuticEngineReadAdapter = { get: getGovernedMedicationReconciliationTherapeuticEngine };
