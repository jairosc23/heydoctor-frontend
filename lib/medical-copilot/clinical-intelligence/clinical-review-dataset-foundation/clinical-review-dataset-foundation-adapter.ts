import { getMedicalCopilotClinicalReviewDatasetFoundation } from "../../api";
import { mapClinicalReviewDatasetFoundationEnvelope } from "./clinical-review-dataset-foundation-mapper";
import type { ClinicalReviewDatasetFoundationBuilderResult } from "./clinical-review-dataset-foundation";

export async function getClinicalReviewDatasetFoundation(sessionId: string): Promise<ClinicalReviewDatasetFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReviewDatasetFoundation(sessionId);
  return mapClinicalReviewDatasetFoundationEnvelope(envelope.data ?? envelope);
}

export type ClinicalReviewDatasetFoundationReadAdapter = { getClinicalReviewDatasetFoundation: typeof getClinicalReviewDatasetFoundation };
export const reviewDatasetReadAdapter: ClinicalReviewDatasetFoundationReadAdapter = { getClinicalReviewDatasetFoundation };
