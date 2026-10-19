import { getMedicalCopilotGovernedDiagnosticConfidenceEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticConfidenceEngineEnvelope } from "./governed-diagnostic-confidence-decision-engine-mapper";
import type { GovernedDiagnosticConfidenceEngineResult } from "./governed-diagnostic-confidence-decision-engine";
export type GovernedDiagnosticConfidenceEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticConfidenceEngineResult | null> };
export async function getGovernedDiagnosticConfidenceEngine(sessionId: string): Promise<GovernedDiagnosticConfidenceEngineResult | null> {
  return mapGovernedDiagnosticConfidenceEngineEnvelope(await getMedicalCopilotGovernedDiagnosticConfidenceEngine(sessionId));
}
export const governedDiagnosticConfidenceEngineReadAdapter: GovernedDiagnosticConfidenceEngineReadAdapter = { get: getGovernedDiagnosticConfidenceEngine };
