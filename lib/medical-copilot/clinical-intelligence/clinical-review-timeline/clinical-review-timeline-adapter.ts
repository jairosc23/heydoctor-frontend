import { getMedicalCopilotClinicalReviewTimeline } from "../../api";
import { mapClinicalReviewTimelineEnvelope } from "./clinical-review-timeline-mapper";
import type { ClinicalReviewTimelineBuilderResult } from "./clinical-review-timeline";

export async function getClinicalReviewTimeline(sessionId: string): Promise<ClinicalReviewTimelineBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReviewTimeline(sessionId);
  return mapClinicalReviewTimelineEnvelope(envelope.data ?? envelope);
}

export type ClinicalReviewTimelineReadAdapter = { getClinicalReviewTimeline: typeof getClinicalReviewTimeline };
export const reviewTimelineReadAdapter: ClinicalReviewTimelineReadAdapter = { getClinicalReviewTimeline };
