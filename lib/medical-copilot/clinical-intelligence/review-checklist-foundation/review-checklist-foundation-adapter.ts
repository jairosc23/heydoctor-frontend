import { getMedicalCopilotReviewChecklistFoundation } from "../../api";
import { mapReviewChecklistFoundationEnvelope } from "./review-checklist-foundation-mapper";
import type { ReviewChecklistFoundationBuilderResult } from "./review-checklist-foundation";

export async function getReviewChecklistFoundation(sessionId: string): Promise<ReviewChecklistFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotReviewChecklistFoundation(sessionId);
  return mapReviewChecklistFoundationEnvelope(envelope.data ?? envelope);
}

export type ReviewChecklistFoundationReadAdapter = { getReviewChecklistFoundation: typeof getReviewChecklistFoundation };
export const checklistReadAdapter: ReviewChecklistFoundationReadAdapter = { getReviewChecklistFoundation };
