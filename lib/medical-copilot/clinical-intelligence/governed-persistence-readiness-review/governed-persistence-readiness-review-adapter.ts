import { getMedicalCopilotGovernedPersistenceReadinessReview } from "../../api";
import { mapGovernedPersistenceReadinessReviewEnvelope } from "./governed-persistence-readiness-review-mapper";
import type { GovernedPersistenceReadinessReviewResult } from "./governed-persistence-readiness-review";

export async function getGovernedPersistenceReadinessReview(
  sessionId: string,
): Promise<GovernedPersistenceReadinessReviewResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessReview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessReviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessReviewReadAdapter = {
  getGovernedPersistenceReadinessReview: typeof getGovernedPersistenceReadinessReview;
};

export const governedPersistenceReadinessReviewReadAdapter: GovernedPersistenceReadinessReviewReadAdapter = {
  getGovernedPersistenceReadinessReview,
};
