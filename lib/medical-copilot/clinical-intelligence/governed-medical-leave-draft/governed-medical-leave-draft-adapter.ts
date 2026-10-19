import { getMedicalCopilotGovernedMedicalLeaveDraft } from "../../api";
import { mapGovernedMedicalLeaveDraftEnvelope } from "./governed-medical-leave-draft-mapper";
import type { GovernedMedicalLeaveDraftResult } from "./governed-medical-leave-draft";

export async function getGovernedMedicalLeaveDraft(
  sessionId: string,
): Promise<GovernedMedicalLeaveDraftResult | null> {
  const envelope = await getMedicalCopilotGovernedMedicalLeaveDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedMedicalLeaveDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedMedicalLeaveDraftReadAdapter = {
  getGovernedMedicalLeaveDraft: typeof getGovernedMedicalLeaveDraft;
};

export const governedMedicalLeaveDraftReadAdapter: GovernedMedicalLeaveDraftReadAdapter =
  { getGovernedMedicalLeaveDraft };
