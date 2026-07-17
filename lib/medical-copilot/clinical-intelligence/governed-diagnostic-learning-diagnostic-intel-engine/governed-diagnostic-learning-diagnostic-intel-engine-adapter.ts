import { getMedicalCopilotGovernedDiagnosticLearningDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticLearningDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-learning-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticLearningDiagnosticIntelEngineResult } from "./governed-diagnostic-learning-diagnostic-intel-engine";
export type GovernedDiagnosticLearningDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticLearningDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticLearningDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticLearningDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticLearningDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticLearningDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticLearningDiagnosticIntelEngineReadAdapter: GovernedDiagnosticLearningDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticLearningDiagnosticIntelEngine };
