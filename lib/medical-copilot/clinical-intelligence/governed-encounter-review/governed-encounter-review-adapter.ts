import { getMedicalCopilotGovernedEncounterReview } from "../../api";
import { mapGovernedEncounterReviewEnvelope } from "./governed-encounter-review-mapper";
import type { GovernedEncounterReviewResult } from "./governed-encounter-review";

export async function getGovernedEncounterReview(
  sessionId: string,
): Promise<GovernedEncounterReviewResult | null> {
  const envelope = await getMedicalCopilotGovernedEncounterReview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedEncounterReviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedEncounterReviewReadAdapter = {
  getGovernedEncounterReview: typeof getGovernedEncounterReview;
};

export const governedEncounterReviewReadAdapter: GovernedEncounterReviewReadAdapter = {
  getGovernedEncounterReview,
};
