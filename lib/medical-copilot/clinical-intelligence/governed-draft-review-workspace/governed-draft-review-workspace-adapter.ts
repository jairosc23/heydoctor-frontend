import { getMedicalCopilotGovernedDraftReviewWorkspace } from "../../api";
import { mapGovernedDraftReviewWorkspaceEnvelope } from "./governed-draft-review-workspace-mapper";
import type { GovernedDraftReviewWorkspaceResult } from "./governed-draft-review-workspace";

export async function getGovernedDraftReviewWorkspace(
  sessionId: string,
): Promise<GovernedDraftReviewWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedDraftReviewWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedDraftReviewWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedDraftReviewWorkspaceReadAdapter = {
  getGovernedDraftReviewWorkspace: typeof getGovernedDraftReviewWorkspace;
};

export const governedDraftReviewWorkspaceReadAdapter: GovernedDraftReviewWorkspaceReadAdapter = {
  getGovernedDraftReviewWorkspace,
};
