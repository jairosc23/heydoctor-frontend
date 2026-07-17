import { getMedicalCopilotGovernedDiagnosticGapDetectionEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticGapDetectionEngineEnvelope } from "./governed-diagnostic-gap-detection-decision-engine-mapper";
import type { GovernedDiagnosticGapDetectionEngineResult } from "./governed-diagnostic-gap-detection-decision-engine";
export type GovernedDiagnosticGapDetectionEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticGapDetectionEngineResult | null> };
export async function getGovernedDiagnosticGapDetectionEngine(sessionId: string): Promise<GovernedDiagnosticGapDetectionEngineResult | null> {
  return mapGovernedDiagnosticGapDetectionEngineEnvelope(await getMedicalCopilotGovernedDiagnosticGapDetectionEngine(sessionId));
}
export const governedDiagnosticGapDetectionEngineReadAdapter: GovernedDiagnosticGapDetectionEngineReadAdapter = { get: getGovernedDiagnosticGapDetectionEngine };
