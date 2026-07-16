import { getMedicalCopilotGovernedPrescriptionDraft } from "../../api";
import { mapGovernedPrescriptionDraftEnvelope } from "./governed-prescription-draft-mapper";
import type { GovernedPrescriptionDraftResult } from "./governed-prescription-draft";

export async function getGovernedPrescriptionDraft(
  sessionId: string,
): Promise<GovernedPrescriptionDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedPrescriptionDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPrescriptionDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPrescriptionDraftReadAdapter = {
  getGovernedPrescriptionDraft: typeof getGovernedPrescriptionDraft;
};

export const governedPrescriptionDraftReadAdapter: GovernedPrescriptionDraftReadAdapter =
  { getGovernedPrescriptionDraft };
