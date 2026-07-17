import { getMedicalCopilotGovernedDiagnosticPrioritizationDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticPrioritizationDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-prioritization-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticPrioritizationDiagnosticIntelEngineResult } from "./governed-diagnostic-prioritization-diagnostic-intel-engine";
export type GovernedDiagnosticPrioritizationDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticPrioritizationDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticPrioritizationDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticPrioritizationDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticPrioritizationDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticPrioritizationDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticPrioritizationDiagnosticIntelEngineReadAdapter: GovernedDiagnosticPrioritizationDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticPrioritizationDiagnosticIntelEngine };
