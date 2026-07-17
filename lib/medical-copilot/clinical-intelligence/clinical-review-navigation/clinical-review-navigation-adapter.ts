import { getMedicalCopilotClinicalReviewNavigation } from "../../api";
import { mapClinicalReviewNavigationEnvelope } from "./clinical-review-navigation-mapper";
import type { ClinicalReviewNavigationBuilderResult } from "./clinical-review-navigation";

export async function getClinicalReviewNavigation(sessionId: string): Promise<ClinicalReviewNavigationBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReviewNavigation(sessionId);
  return mapClinicalReviewNavigationEnvelope(envelope.data ?? envelope);
}

export type ClinicalReviewNavigationReadAdapter = { getClinicalReviewNavigation: typeof getClinicalReviewNavigation };
export const reviewNavigationReadAdapter: ClinicalReviewNavigationReadAdapter = { getClinicalReviewNavigation };
