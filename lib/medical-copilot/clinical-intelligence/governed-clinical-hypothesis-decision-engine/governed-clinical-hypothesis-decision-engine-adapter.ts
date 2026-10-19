import { getMedicalCopilotGovernedClinicalHypothesisEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalHypothesisEngineEnvelope } from "./governed-clinical-hypothesis-decision-engine-mapper";
import type { GovernedClinicalHypothesisEngineResult } from "./governed-clinical-hypothesis-decision-engine";
export type GovernedClinicalHypothesisEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalHypothesisEngineResult | null> };
export async function getGovernedClinicalHypothesisEngine(sessionId: string): Promise<GovernedClinicalHypothesisEngineResult | null> {
  return mapGovernedClinicalHypothesisEngineEnvelope(await getMedicalCopilotGovernedClinicalHypothesisEngine(sessionId));
}
export const governedClinicalHypothesisEngineReadAdapter: GovernedClinicalHypothesisEngineReadAdapter = { get: getGovernedClinicalHypothesisEngine };
