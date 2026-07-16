import { getMedicalCopilotPhysicianReasoningReview } from "../../api";
import { mapPhysicianReasoningReviewEnvelope } from "./physician-reasoning-review-mapper";
import type { PhysicianReasoningReviewBuilderResult } from "./physician-reasoning-review";
export async function getPhysicianReasoningReview(sessionId: string): Promise<PhysicianReasoningReviewBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianReasoningReview(sessionId);
  return mapPhysicianReasoningReviewEnvelope(envelope.data ?? envelope);
}
export type PhysicianReasoningReviewReadAdapter = { getPhysicianReasoningReview: typeof getPhysicianReasoningReview };
export const physicianReasoningReviewReadAdapter: PhysicianReasoningReviewReadAdapter = { getPhysicianReasoningReview };
