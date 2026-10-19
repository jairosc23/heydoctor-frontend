import { getMedicalCopilotGovernedPhysicianReviewPreparationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPhysicianReviewPreparationEngineEnvelope } from "./governed-physician-review-preparation-decision-engine-mapper";
import type { GovernedPhysicianReviewPreparationEngineResult } from "./governed-physician-review-preparation-decision-engine";
export type GovernedPhysicianReviewPreparationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPhysicianReviewPreparationEngineResult | null> };
export async function getGovernedPhysicianReviewPreparationEngine(sessionId: string): Promise<GovernedPhysicianReviewPreparationEngineResult | null> {
  return mapGovernedPhysicianReviewPreparationEngineEnvelope(await getMedicalCopilotGovernedPhysicianReviewPreparationEngine(sessionId));
}
export const governedPhysicianReviewPreparationEngineReadAdapter: GovernedPhysicianReviewPreparationEngineReadAdapter = { get: getGovernedPhysicianReviewPreparationEngine };
