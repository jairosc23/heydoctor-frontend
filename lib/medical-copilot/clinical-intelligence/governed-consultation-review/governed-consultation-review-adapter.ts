import { getMedicalCopilotGovernedConsultationReview } from "../../api";
import { mapGovernedConsultationReviewEnvelope } from "./governed-consultation-review-mapper";
import type { GovernedConsultationReviewResult } from "./governed-consultation-review";

export async function getGovernedConsultationReview(
  sessionId: string,
): Promise<GovernedConsultationReviewResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationReview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationReviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationReviewReadAdapter = {
  getGovernedConsultationReview: typeof getGovernedConsultationReview;
};

export const governedConsultationReviewReadAdapter: GovernedConsultationReviewReadAdapter = {
  getGovernedConsultationReview,
};
