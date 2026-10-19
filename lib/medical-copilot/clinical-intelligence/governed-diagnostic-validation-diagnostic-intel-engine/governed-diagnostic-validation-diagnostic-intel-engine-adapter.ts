import { getMedicalCopilotGovernedDiagnosticValidationDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticValidationDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-validation-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticValidationDiagnosticIntelEngineResult } from "./governed-diagnostic-validation-diagnostic-intel-engine";
export type GovernedDiagnosticValidationDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticValidationDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticValidationDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticValidationDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticValidationDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticValidationDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticValidationDiagnosticIntelEngineReadAdapter: GovernedDiagnosticValidationDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticValidationDiagnosticIntelEngine };
