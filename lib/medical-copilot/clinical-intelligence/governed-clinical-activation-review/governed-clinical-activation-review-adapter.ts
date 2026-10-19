import { getMedicalCopilotGovernedClinicalActivationReview } from "../../api";
import { mapGovernedClinicalActivationReviewEnvelope } from "./governed-clinical-activation-review-mapper";
import type { GovernedClinicalActivationReviewResult } from "./governed-clinical-activation-review";

export async function getGovernedClinicalActivationReview(
  sessionId: string,
): Promise<GovernedClinicalActivationReviewResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationReview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationReviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationReviewReadAdapter = {
  getGovernedClinicalActivationReview: typeof getGovernedClinicalActivationReview;
};

export const governedClinicalActivationReviewReadAdapter: GovernedClinicalActivationReviewReadAdapter = {
  getGovernedClinicalActivationReview,
};
