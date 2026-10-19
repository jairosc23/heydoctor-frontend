import { getMedicalCopilotGovernedRareDiseaseAwarenessDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedRareDiseaseAwarenessDiagnosticIntelEngineEnvelope } from "./governed-rare-disease-awareness-diagnostic-intel-engine-mapper";
import type { GovernedRareDiseaseAwarenessDiagnosticIntelEngineResult } from "./governed-rare-disease-awareness-diagnostic-intel-engine";
export type GovernedRareDiseaseAwarenessDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedRareDiseaseAwarenessDiagnosticIntelEngineResult | null> };
export async function getGovernedRareDiseaseAwarenessDiagnosticIntelEngine(sessionId: string): Promise<GovernedRareDiseaseAwarenessDiagnosticIntelEngineResult | null> { return mapGovernedRareDiseaseAwarenessDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedRareDiseaseAwarenessDiagnosticIntelEngine(sessionId)); }
export const governedRareDiseaseAwarenessDiagnosticIntelEngineReadAdapter: GovernedRareDiseaseAwarenessDiagnosticIntelEngineReadAdapter = { get: getGovernedRareDiseaseAwarenessDiagnosticIntelEngine };
