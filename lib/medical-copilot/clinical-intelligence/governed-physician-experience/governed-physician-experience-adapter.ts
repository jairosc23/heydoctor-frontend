import { getMedicalCopilotGovernedPhysicianExperience } from "../../api";
import { mapGovernedPhysicianExperienceEnvelope } from "./governed-physician-experience-mapper";
import type { GovernedPhysicianExperienceResult } from "./governed-physician-experience";

export async function getGovernedPhysicianExperience(
  sessionId: string,
): Promise<GovernedPhysicianExperienceResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianExperience(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianExperienceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianExperienceReadAdapter = {
  getGovernedPhysicianExperience: typeof getGovernedPhysicianExperience;
};

export const governedPhysicianExperienceReadAdapter: GovernedPhysicianExperienceReadAdapter = {
  getGovernedPhysicianExperience,
};
