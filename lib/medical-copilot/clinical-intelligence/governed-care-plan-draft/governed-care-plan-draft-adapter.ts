import { getMedicalCopilotGovernedCarePlanDraft } from "../../api";
import { mapGovernedCarePlanDraftEnvelope } from "./governed-care-plan-draft-mapper";
import type { GovernedCarePlanDraftResult } from "./governed-care-plan-draft";

export async function getGovernedCarePlanDraft(
  sessionId: string,
): Promise<GovernedCarePlanDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedCarePlanDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedCarePlanDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedCarePlanDraftReadAdapter = {
  getGovernedCarePlanDraft: typeof getGovernedCarePlanDraft;
};

export const governedCarePlanDraftReadAdapter: GovernedCarePlanDraftReadAdapter =
  { getGovernedCarePlanDraft };
