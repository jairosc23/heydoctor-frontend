import { getMedicalCopilotGovernedVaccinationReview } from "../../api";
import { mapGovernedVaccinationReviewEnvelope } from "./governed-vaccination-review-mapper";
import type { GovernedVaccinationReviewResult } from "./governed-vaccination-review";

export async function getGovernedVaccinationReview(sessionId: string): Promise<GovernedVaccinationReviewResult | null> {
  const envelope = await getMedicalCopilotGovernedVaccinationReview(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedVaccinationReviewEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedVaccinationReviewReadAdapter = { getGovernedVaccinationReview: typeof getGovernedVaccinationReview };
export const governedVaccinationReviewReadAdapter: GovernedVaccinationReviewReadAdapter = { getGovernedVaccinationReview };
