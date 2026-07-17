import { getMedicalCopilotGovernedHypothesisValidationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedHypothesisValidationEngineEnvelope } from "./governed-hypothesis-validation-decision-engine-mapper";
import type { GovernedHypothesisValidationEngineResult } from "./governed-hypothesis-validation-decision-engine";
export type GovernedHypothesisValidationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedHypothesisValidationEngineResult | null> };
export async function getGovernedHypothesisValidationEngine(sessionId: string): Promise<GovernedHypothesisValidationEngineResult | null> {
  return mapGovernedHypothesisValidationEngineEnvelope(await getMedicalCopilotGovernedHypothesisValidationEngine(sessionId));
}
export const governedHypothesisValidationEngineReadAdapter: GovernedHypothesisValidationEngineReadAdapter = { get: getGovernedHypothesisValidationEngine };
