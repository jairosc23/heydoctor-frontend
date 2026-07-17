import { getMedicalCopilotGovernedDiagnosticTimelineDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticTimelineDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-timeline-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticTimelineDiagnosticIntelEngineResult } from "./governed-diagnostic-timeline-diagnostic-intel-engine";
export type GovernedDiagnosticTimelineDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticTimelineDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticTimelineDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticTimelineDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticTimelineDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticTimelineDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticTimelineDiagnosticIntelEngineReadAdapter: GovernedDiagnosticTimelineDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticTimelineDiagnosticIntelEngine };
