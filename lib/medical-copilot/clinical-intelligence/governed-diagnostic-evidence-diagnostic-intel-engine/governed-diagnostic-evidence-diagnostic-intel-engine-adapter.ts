import { getMedicalCopilotGovernedDiagnosticEvidenceDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticEvidenceDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-evidence-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticEvidenceDiagnosticIntelEngineResult } from "./governed-diagnostic-evidence-diagnostic-intel-engine";
export type GovernedDiagnosticEvidenceDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticEvidenceDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticEvidenceDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticEvidenceDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticEvidenceDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticEvidenceDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticEvidenceDiagnosticIntelEngineReadAdapter: GovernedDiagnosticEvidenceDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticEvidenceDiagnosticIntelEngine };
