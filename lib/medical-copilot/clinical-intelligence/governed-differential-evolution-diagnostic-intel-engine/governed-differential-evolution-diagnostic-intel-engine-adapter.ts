import { getMedicalCopilotGovernedDifferentialEvolutionDiagnosticIntelEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDifferentialEvolutionDiagnosticIntelEngineEnvelope } from "./governed-differential-evolution-diagnostic-intel-engine-mapper";
import type { GovernedDifferentialEvolutionDiagnosticIntelEngineResult } from "./governed-differential-evolution-diagnostic-intel-engine";
export type GovernedDifferentialEvolutionDiagnosticIntelEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDifferentialEvolutionDiagnosticIntelEngineResult | null> };
export async function getGovernedDifferentialEvolutionDiagnosticIntelEngine(sessionId: string): Promise<GovernedDifferentialEvolutionDiagnosticIntelEngineResult | null> { return mapGovernedDifferentialEvolutionDiagnosticIntelEngineEnvelope(await getMedicalCopilotGovernedDifferentialEvolutionDiagnosticIntelEngine(sessionId)); }
export const governedDifferentialEvolutionDiagnosticIntelEngineReadAdapter: GovernedDifferentialEvolutionDiagnosticIntelEngineReadAdapter = { get: getGovernedDifferentialEvolutionDiagnosticIntelEngine };
