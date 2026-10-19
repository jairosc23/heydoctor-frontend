import { getMedicalCopilotGovernedSyndromicRecognitionDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedSyndromicRecognitionDiagnosticIntelEngineEnvelope } from "./governed-syndromic-recognition-diagnostic-intel-engine-mapper";
import type { GovernedSyndromicRecognitionDiagnosticIntelEngineResult } from "./governed-syndromic-recognition-diagnostic-intel-engine";
export type GovernedSyndromicRecognitionDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedSyndromicRecognitionDiagnosticIntelEngineResult | null> };
export async function getGovernedSyndromicRecognitionDiagnosticIntelEngine(sessionId: string): Promise<GovernedSyndromicRecognitionDiagnosticIntelEngineResult | null> { return mapGovernedSyndromicRecognitionDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedSyndromicRecognitionDiagnosticIntelEngine(sessionId)); }
export const governedSyndromicRecognitionDiagnosticIntelEngineReadAdapter: GovernedSyndromicRecognitionDiagnosticIntelEngineReadAdapter = { get: getGovernedSyndromicRecognitionDiagnosticIntelEngine };
