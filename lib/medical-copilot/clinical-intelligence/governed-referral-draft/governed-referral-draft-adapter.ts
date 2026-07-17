import { getMedicalCopilotGovernedReferralDraft } from "../../api";
import { mapGovernedReferralDraftEnvelope } from "./governed-referral-draft-mapper";
import type { GovernedReferralDraftResult } from "./governed-referral-draft";

export async function getGovernedReferralDraft(
  sessionId: string,
): Promise<GovernedReferralDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedReferralDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedReferralDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedReferralDraftReadAdapter = {
  getGovernedReferralDraft: typeof getGovernedReferralDraft;
};

export const governedReferralDraftReadAdapter: GovernedReferralDraftReadAdapter =
  { getGovernedReferralDraft };
