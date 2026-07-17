import { getMedicalCopilotGovernedConsultationExperience } from "../../api";
import { mapGovernedConsultationExperienceEnvelope } from "./governed-consultation-experience-mapper";
import type { GovernedConsultationExperienceResult } from "./governed-consultation-experience";

export async function getGovernedConsultationExperience(
  sessionId: string,
): Promise<GovernedConsultationExperienceResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationExperience(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationExperienceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationExperienceReadAdapter = {
  getGovernedConsultationExperience: typeof getGovernedConsultationExperience;
};

export const governedConsultationExperienceReadAdapter: GovernedConsultationExperienceReadAdapter = {
  getGovernedConsultationExperience,
};
