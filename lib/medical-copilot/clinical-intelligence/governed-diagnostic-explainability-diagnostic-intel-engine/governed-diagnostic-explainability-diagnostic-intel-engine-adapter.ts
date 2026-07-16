import { getMedicalCopilotGovernedDiagnosticExplainabilityDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticExplainabilityDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-explainability-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticExplainabilityDiagnosticIntelEngineResult } from "./governed-diagnostic-explainability-diagnostic-intel-engine";
export type GovernedDiagnosticExplainabilityDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticExplainabilityDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticExplainabilityDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticExplainabilityDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticExplainabilityDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticExplainabilityDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticExplainabilityDiagnosticIntelEngineReadAdapter: GovernedDiagnosticExplainabilityDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticExplainabilityDiagnosticIntelEngine };
