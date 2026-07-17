import { getMedicalCopilotGovernedDiagnosticConfidenceDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticConfidenceDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-confidence-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticConfidenceDiagnosticIntelEngineResult } from "./governed-diagnostic-confidence-diagnostic-intel-engine";
export type GovernedDiagnosticConfidenceDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticConfidenceDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticConfidenceDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticConfidenceDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticConfidenceDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticConfidenceDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticConfidenceDiagnosticIntelEngineReadAdapter: GovernedDiagnosticConfidenceDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticConfidenceDiagnosticIntelEngine };
