import { getMedicalCopilotGovernedSoapDraft } from "../../api";
import { mapGovernedSoapDraftEnvelope } from "./governed-soap-draft-mapper";
import type { GovernedSoapDraftResult } from "./governed-soap-draft";

export async function getGovernedSoapDraft(
  sessionId: string,
): Promise<GovernedSoapDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedSoapDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedSoapDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedSoapDraftReadAdapter = {
  getGovernedSoapDraft: typeof getGovernedSoapDraft;
};

export const governedSoapDraftReadAdapter: GovernedSoapDraftReadAdapter = {
  getGovernedSoapDraft,
};
