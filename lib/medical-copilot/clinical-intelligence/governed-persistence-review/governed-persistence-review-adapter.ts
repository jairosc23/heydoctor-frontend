import { getMedicalCopilotGovernedPersistenceReview } from "../../api";
import { mapGovernedPersistenceReviewEnvelope } from "./governed-persistence-review-mapper";
import type { GovernedPersistenceReviewResult } from "./governed-persistence-review";

export async function getGovernedPersistenceReview(
  sessionId: string,
): Promise<GovernedPersistenceReviewResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReviewReadAdapter = {
  getGovernedPersistenceReview: typeof getGovernedPersistenceReview;
};

export const governedPersistenceReviewReadAdapter: GovernedPersistenceReviewReadAdapter = {
  getGovernedPersistenceReview,
};
