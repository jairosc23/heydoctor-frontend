import { getMedicalCopilotGovernedClinicalAssistance } from "../../api";
import { mapGovernedClinicalAssistanceEnvelope } from "./governed-clinical-assistance-mapper";
import type { GovernedClinicalAssistanceResult } from "./governed-clinical-assistance";

export async function getGovernedClinicalAssistance(
  sessionId: string,
): Promise<GovernedClinicalAssistanceResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalAssistance(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalAssistanceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalAssistanceReadAdapter = {
  getGovernedClinicalAssistance: typeof getGovernedClinicalAssistance;
};

export const governedClinicalAssistanceReadAdapter: GovernedClinicalAssistanceReadAdapter =
  { getGovernedClinicalAssistance };
