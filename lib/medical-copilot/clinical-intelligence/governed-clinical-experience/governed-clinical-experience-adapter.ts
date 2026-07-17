import { getMedicalCopilotGovernedClinicalExperience } from "../../api";
import { mapGovernedClinicalExperienceEnvelope } from "./governed-clinical-experience-mapper";
import type { GovernedClinicalExperienceResult } from "./governed-clinical-experience";

export async function getGovernedClinicalExperience(
  sessionId: string,
): Promise<GovernedClinicalExperienceResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalExperience(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalExperienceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalExperienceReadAdapter = {
  getGovernedClinicalExperience: typeof getGovernedClinicalExperience;
};

export const governedClinicalExperienceReadAdapter: GovernedClinicalExperienceReadAdapter = {
  getGovernedClinicalExperience,
};
