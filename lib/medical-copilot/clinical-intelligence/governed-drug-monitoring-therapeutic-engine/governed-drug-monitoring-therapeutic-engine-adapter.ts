import { getMedicalCopilotGovernedDrugMonitoringTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDrugMonitoringTherapeuticEngineEnvelope } from "./governed-drug-monitoring-therapeutic-engine-mapper";
import type { GovernedDrugMonitoringTherapeuticEngineResult } from "./governed-drug-monitoring-therapeutic-engine";
export type GovernedDrugMonitoringTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDrugMonitoringTherapeuticEngineResult | null> };
export async function getGovernedDrugMonitoringTherapeuticEngine(sessionId: string): Promise<GovernedDrugMonitoringTherapeuticEngineResult | null> { return mapGovernedDrugMonitoringTherapeuticEngineEnvelope(await getMedicalCopilotGovernedDrugMonitoringTherapeuticEngine(sessionId)); }
export const governedDrugMonitoringTherapeuticEngineReadAdapter: GovernedDrugMonitoringTherapeuticEngineReadAdapter = { get: getGovernedDrugMonitoringTherapeuticEngine };
