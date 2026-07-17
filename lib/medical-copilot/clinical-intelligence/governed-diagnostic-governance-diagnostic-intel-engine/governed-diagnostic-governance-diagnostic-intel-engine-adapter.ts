import { getMedicalCopilotGovernedDiagnosticGovernanceDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticGovernanceDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-governance-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticGovernanceDiagnosticIntelEngineResult } from "./governed-diagnostic-governance-diagnostic-intel-engine";
export type GovernedDiagnosticGovernanceDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticGovernanceDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticGovernanceDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticGovernanceDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticGovernanceDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticGovernanceDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticGovernanceDiagnosticIntelEngineReadAdapter: GovernedDiagnosticGovernanceDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticGovernanceDiagnosticIntelEngine };
