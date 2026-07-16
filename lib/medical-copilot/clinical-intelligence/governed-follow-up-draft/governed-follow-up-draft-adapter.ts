import { getMedicalCopilotGovernedFollowUpDraft } from "../../api";
import { mapGovernedFollowUpDraftEnvelope } from "./governed-follow-up-draft-mapper";
import type { GovernedFollowUpDraftResult } from "./governed-follow-up-draft";

export async function getGovernedFollowUpDraft(
  sessionId: string,
): Promise<GovernedFollowUpDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedFollowUpDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedFollowUpDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedFollowUpDraftReadAdapter = {
  getGovernedFollowUpDraft: typeof getGovernedFollowUpDraft;
};

export const governedFollowUpDraftReadAdapter: GovernedFollowUpDraftReadAdapter =
  { getGovernedFollowUpDraft };
