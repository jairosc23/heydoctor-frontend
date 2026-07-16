import { getMedicalCopilotGovernedDiagnosticReviewDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticReviewDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-review-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticReviewDiagnosticIntelEngineResult } from "./governed-diagnostic-review-diagnostic-intel-engine";
export type GovernedDiagnosticReviewDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticReviewDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticReviewDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticReviewDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticReviewDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticReviewDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticReviewDiagnosticIntelEngineReadAdapter: GovernedDiagnosticReviewDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticReviewDiagnosticIntelEngine };
