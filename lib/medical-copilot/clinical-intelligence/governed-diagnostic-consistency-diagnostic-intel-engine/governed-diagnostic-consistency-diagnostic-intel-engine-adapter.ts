import { getMedicalCopilotGovernedDiagnosticConsistencyDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticConsistencyDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-consistency-diagnostic-intel-engine-mapper";
import type { GovernedDiagnosticConsistencyDiagnosticIntelEngineResult } from "./governed-diagnostic-consistency-diagnostic-intel-engine";
export type GovernedDiagnosticConsistencyDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticConsistencyDiagnosticIntelEngineResult | null> };
export async function getGovernedDiagnosticConsistencyDiagnosticIntelEngine(sessionId: string): Promise<GovernedDiagnosticConsistencyDiagnosticIntelEngineResult | null> { return mapGovernedDiagnosticConsistencyDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDiagnosticConsistencyDiagnosticIntelEngine(sessionId)); }
export const governedDiagnosticConsistencyDiagnosticIntelEngineReadAdapter: GovernedDiagnosticConsistencyDiagnosticIntelEngineReadAdapter = { get: getGovernedDiagnosticConsistencyDiagnosticIntelEngine };
