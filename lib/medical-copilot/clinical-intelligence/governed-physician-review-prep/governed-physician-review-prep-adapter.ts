/**
 * AI-14 — Read adapter for GovernedPhysicianReviewPrep (Facade only).
 */

import { getMedicalCopilotGovernedPhysicianReviewPrep } from "../../api";
import { mapGovernedPhysicianReviewPrepEnvelope } from "./governed-physician-review-prep-mapper";
import type { GovernedPhysicianReviewPrepBuilderResult } from "./governed-physician-review-prep";

export async function getGovernedPhysicianReviewPrep(
  sessionId: string,
): Promise<GovernedPhysicianReviewPrepBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianReviewPrep(sessionId);
  return mapGovernedPhysicianReviewPrepEnvelope(envelope.data ?? envelope);
}

export type GovernedPhysicianReviewPrepReadAdapter = {
  getGovernedPhysicianReviewPrep: typeof getGovernedPhysicianReviewPrep;
};

export const reviewPrepReadAdapter: GovernedPhysicianReviewPrepReadAdapter = {
  getGovernedPhysicianReviewPrep,
};
