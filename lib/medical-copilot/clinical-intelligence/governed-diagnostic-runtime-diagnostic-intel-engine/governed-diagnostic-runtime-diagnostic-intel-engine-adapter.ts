import { getMedicalCopilotGovernedDiagnosticRuntimeDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticRuntimeDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-runtime-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticRuntimeDiagnosticIntelEngineResult } from "./governed-diagnostic-runtime-diagnostic-intel-engine";
export type GovernedDiagnosticRuntimeDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticRuntimeDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticRuntimeDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticRuntimeDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticRuntimeDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticRuntimeDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticRuntimeDiagnosticIntelEngineReadAdapter: GovernedDiagnosticRuntimeDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticRuntimeDiagnosticIntelEngine };
