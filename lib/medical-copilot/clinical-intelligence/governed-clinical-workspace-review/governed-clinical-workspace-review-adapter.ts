import { getMedicalCopilotGovernedClinicalWorkspaceReview } from "../../api";
import { mapGovernedClinicalWorkspaceReviewEnvelope } from "./governed-clinical-workspace-review-mapper";
import type { GovernedClinicalWorkspaceReviewResult } from "./governed-clinical-workspace-review";

export async function getGovernedClinicalWorkspaceReview(
  sessionId: string,
): Promise<GovernedClinicalWorkspaceReviewResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalWorkspaceReview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalWorkspaceReviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalWorkspaceReviewReadAdapter = {
  getGovernedClinicalWorkspaceReview: typeof getGovernedClinicalWorkspaceReview;
};

export const governedClinicalWorkspaceReviewReadAdapter: GovernedClinicalWorkspaceReviewReadAdapter = {
  getGovernedClinicalWorkspaceReview,
};
