import { getMedicalCopilotGovernedDischargeDraft } from "../../api";
import { mapGovernedDischargeDraftEnvelope } from "./governed-discharge-draft-mapper";
import type { GovernedDischargeDraftResult } from "./governed-discharge-draft";

export async function getGovernedDischargeDraft(
  sessionId: string,
): Promise<GovernedDischargeDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedDischargeDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedDischargeDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedDischargeDraftReadAdapter = {
  getGovernedDischargeDraft: typeof getGovernedDischargeDraft;
};

export const governedDischargeDraftReadAdapter: GovernedDischargeDraftReadAdapter =
  { getGovernedDischargeDraft };
