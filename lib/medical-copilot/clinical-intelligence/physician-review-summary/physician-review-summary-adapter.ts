import { getMedicalCopilotPhysicianReviewSummary } from "../../api";
import { mapPhysicianReviewSummaryEnvelope } from "./physician-review-summary-mapper";
import type { PhysicianReviewSummaryBuilderResult } from "./physician-review-summary";

export async function getPhysicianReviewSummary(sessionId: string): Promise<PhysicianReviewSummaryBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianReviewSummary(sessionId);
  return mapPhysicianReviewSummaryEnvelope(envelope.data ?? envelope);
}

export type PhysicianReviewSummaryReadAdapter = { getPhysicianReviewSummary: typeof getPhysicianReviewSummary };
export const reviewSummaryReadAdapter: PhysicianReviewSummaryReadAdapter = { getPhysicianReviewSummary };
