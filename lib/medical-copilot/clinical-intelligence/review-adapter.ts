/**
 * CI-7 — Read adapter for Governed Clinical Review (Facade only).
 */

import { getMedicalCopilotClinicalReview } from "../api";
import { mapReviewEnvelope } from "./review-mapper";
import type { ClinicalReviewResult } from "./review";

export async function getClinicalReview(
  sessionId: string,
): Promise<ClinicalReviewResult | null> {
  const envelope = await getMedicalCopilotClinicalReview(sessionId);
  return mapReviewEnvelope(envelope.data ?? envelope);
}

export type ClinicalReviewReadAdapter = {
  getClinicalReview: typeof getClinicalReview;
};

export const clinicalReviewReadAdapter: ClinicalReviewReadAdapter = {
  getClinicalReview,
};
