import { getMedicalCopilotGovernedDifferentialDiagnosisRankingEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDifferentialDiagnosisRankingEngineEnvelope } from "./governed-differential-diagnosis-ranking-decision-engine-mapper";
import type { GovernedDifferentialDiagnosisRankingEngineResult } from "./governed-differential-diagnosis-ranking-decision-engine";
export type GovernedDifferentialDiagnosisRankingEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDifferentialDiagnosisRankingEngineResult | null> };
export async function getGovernedDifferentialDiagnosisRankingEngine(sessionId: string): Promise<GovernedDifferentialDiagnosisRankingEngineResult | null> {
  return mapGovernedDifferentialDiagnosisRankingEngineEnvelope(await getMedicalCopilotGovernedDifferentialDiagnosisRankingEngine(sessionId));
}
export const governedDifferentialDiagnosisRankingEngineReadAdapter: GovernedDifferentialDiagnosisRankingEngineReadAdapter = { get: getGovernedDifferentialDiagnosisRankingEngine };
