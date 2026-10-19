import { getMedicalCopilotGovernedClinicalDraft } from "../../api";
import { mapGovernedClinicalDraftEnvelope } from "./governed-clinical-draft-mapper";
import type { GovernedClinicalDraftResult } from "./governed-clinical-draft";

export async function getGovernedClinicalDraft(
  sessionId: string,
): Promise<GovernedClinicalDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalDraftReadAdapter = {
  getGovernedClinicalDraft: typeof getGovernedClinicalDraft;
};

export const governedClinicalDraftReadAdapter: GovernedClinicalDraftReadAdapter =
  { getGovernedClinicalDraft };
