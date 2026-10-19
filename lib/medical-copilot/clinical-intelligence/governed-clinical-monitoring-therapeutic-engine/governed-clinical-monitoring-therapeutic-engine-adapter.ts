import { getMedicalCopilotGovernedClinicalMonitoringTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalMonitoringTherapeuticEngineEnvelope } from "./governed-clinical-monitoring-therapeutic-engine-mapper";
import type { GovernedClinicalMonitoringTherapeuticEngineResult } from "./governed-clinical-monitoring-therapeutic-engine";
export type GovernedClinicalMonitoringTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalMonitoringTherapeuticEngineResult | null> };
export async function getGovernedClinicalMonitoringTherapeuticEngine(sessionId: string): Promise<GovernedClinicalMonitoringTherapeuticEngineResult | null> { return mapGovernedClinicalMonitoringTherapeuticEngineEnvelope(await getMedicalCopilotGovernedClinicalMonitoringTherapeuticEngine(sessionId)); }
export const governedClinicalMonitoringTherapeuticEngineReadAdapter: GovernedClinicalMonitoringTherapeuticEngineReadAdapter = { get: getGovernedClinicalMonitoringTherapeuticEngine };
