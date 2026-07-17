import { getMedicalCopilotGovernedDiagnosticCorrelationDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticCorrelationDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-correlation-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticCorrelationDiagnosticIntelEngineResult } from "./governed-diagnostic-correlation-diagnostic-intel-engine";
export type GovernedDiagnosticCorrelationDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticCorrelationDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticCorrelationDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticCorrelationDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticCorrelationDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticCorrelationDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticCorrelationDiagnosticIntelEngineReadAdapter: GovernedDiagnosticCorrelationDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticCorrelationDiagnosticIntelEngine };
