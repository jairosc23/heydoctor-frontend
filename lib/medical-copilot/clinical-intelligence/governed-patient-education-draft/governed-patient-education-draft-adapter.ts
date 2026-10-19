import { getMedicalCopilotGovernedPatientEducationDraft } from "../../api";
import { mapGovernedPatientEducationDraftEnvelope } from "./governed-patient-education-draft-mapper";
import type { GovernedPatientEducationDraftResult } from "./governed-patient-education-draft";

export async function getGovernedPatientEducationDraft(
  sessionId: string,
): Promise<GovernedPatientEducationDraftResult | null> {
  const envelope =
    await getMedicalCopilotGovernedPatientEducationDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPatientEducationDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPatientEducationDraftReadAdapter = {
  getGovernedPatientEducationDraft: typeof getGovernedPatientEducationDraft;
};

export const governedPatientEducationDraftReadAdapter: GovernedPatientEducationDraftReadAdapter =
  { getGovernedPatientEducationDraft };
