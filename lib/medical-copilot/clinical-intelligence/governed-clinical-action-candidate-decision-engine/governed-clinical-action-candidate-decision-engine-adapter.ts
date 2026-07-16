import { getMedicalCopilotGovernedClinicalActionCandidateEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalActionCandidateEngineEnvelope } from "./governed-clinical-action-candidate-decision-engine-mapper";
import type { GovernedClinicalActionCandidateEngineResult } from "./governed-clinical-action-candidate-decision-engine";
export type GovernedClinicalActionCandidateEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalActionCandidateEngineResult | null> };
export async function getGovernedClinicalActionCandidateEngine(sessionId: string): Promise<GovernedClinicalActionCandidateEngineResult | null> {
  return mapGovernedClinicalActionCandidateEngineEnvelope(await getMedicalCopilotGovernedClinicalActionCandidateEngine(sessionId));
}
export const governedClinicalActionCandidateEngineReadAdapter: GovernedClinicalActionCandidateEngineReadAdapter = { get: getGovernedClinicalActionCandidateEngine };
