import { getMedicalCopilotGovernedClinicalClusteringDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalClusteringDiagnosticIntelEngineEnvelope } from "./governed-clinical-clustering-diagnostic-intel-engine-mapper";
import type { GovernedClinicalClusteringDiagnosticIntelEngineResult } from "./governed-clinical-clustering-diagnostic-intel-engine";
export type GovernedClinicalClusteringDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalClusteringDiagnosticIntelEngineResult | null> };
export async function getGovernedClinicalClusteringDiagnosticIntelEngine(sessionId: string): Promise<GovernedClinicalClusteringDiagnosticIntelEngineResult | null> { return mapGovernedClinicalClusteringDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedClinicalClusteringDiagnosticIntelEngine(sessionId)); }
export const governedClinicalClusteringDiagnosticIntelEngineReadAdapter: GovernedClinicalClusteringDiagnosticIntelEngineReadAdapter = { get: getGovernedClinicalClusteringDiagnosticIntelEngine };
