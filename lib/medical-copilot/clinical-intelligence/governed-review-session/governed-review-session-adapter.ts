import { getMedicalCopilotGovernedReviewSession } from "../../api";
import { mapGovernedReviewSessionEnvelope } from "./governed-review-session-mapper";
import type { GovernedReviewSessionBuilderResult } from "./governed-review-session";

export async function getGovernedReviewSession(sessionId: string): Promise<GovernedReviewSessionBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedReviewSession(sessionId);
  return mapGovernedReviewSessionEnvelope(envelope.data ?? envelope);
}

export type GovernedReviewSessionReadAdapter = { getGovernedReviewSession: typeof getGovernedReviewSession };
export const reviewSessionReadAdapter: GovernedReviewSessionReadAdapter = { getGovernedReviewSession };
