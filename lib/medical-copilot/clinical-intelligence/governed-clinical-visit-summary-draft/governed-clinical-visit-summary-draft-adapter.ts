import { getMedicalCopilotGovernedClinicalVisitSummaryDraft } from "../../api";
import { mapGovernedClinicalVisitSummaryDraftEnvelope } from "./governed-clinical-visit-summary-draft-mapper";
import type { GovernedClinicalVisitSummaryDraftResult } from "./governed-clinical-visit-summary-draft";

export async function getGovernedClinicalVisitSummaryDraft(
  sessionId: string,
): Promise<GovernedClinicalVisitSummaryDraftResult | null> {
  const envelope =
    await getMedicalCopilotGovernedClinicalVisitSummaryDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalVisitSummaryDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalVisitSummaryDraftReadAdapter = {
  getGovernedClinicalVisitSummaryDraft: typeof getGovernedClinicalVisitSummaryDraft;
};

export const governedClinicalVisitSummaryDraftReadAdapter: GovernedClinicalVisitSummaryDraftReadAdapter =
  { getGovernedClinicalVisitSummaryDraft };
