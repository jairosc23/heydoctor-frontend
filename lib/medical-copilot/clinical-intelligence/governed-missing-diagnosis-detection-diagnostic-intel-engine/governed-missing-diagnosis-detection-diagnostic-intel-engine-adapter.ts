import { getMedicalCopilotGovernedMissingDiagnosisDetectionDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMissingDiagnosisDetectionDiagnosticIntelEngineEnvelope } from "./governed-missing-diagnosis-detection-diagnostic-intel-engine-mapper";
import type { GovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult } from "./governed-missing-diagnosis-detection-diagnostic-intel-engine";
export type GovernedMissingDiagnosisDetectionDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult | null> };
export async function getGovernedMissingDiagnosisDetectionDiagnosticIntelEngine(sessionId: string): Promise<GovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult | null> { return mapGovernedMissingDiagnosisDetectionDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedMissingDiagnosisDetectionDiagnosticIntelEngine(sessionId)); }
export const governedMissingDiagnosisDetectionDiagnosticIntelEngineReadAdapter: GovernedMissingDiagnosisDetectionDiagnosticIntelEngineReadAdapter = { get: getGovernedMissingDiagnosisDetectionDiagnosticIntelEngine };
