import { getMedicalCopilotGovernedDiagnosticAlertsDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticAlertsDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-alerts-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticAlertsDiagnosticIntelEngineResult } from "./governed-diagnostic-alerts-diagnostic-intel-engine";
export type GovernedDiagnosticAlertsDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticAlertsDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticAlertsDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticAlertsDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticAlertsDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticAlertsDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticAlertsDiagnosticIntelEngineReadAdapter: GovernedDiagnosticAlertsDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticAlertsDiagnosticIntelEngine };
