import { getMedicalCopilotGovernedPhysicianReviewExperience } from "../../api";
import { mapGovernedPhysicianReviewExperienceEnvelope } from "./governed-physician-review-experience-mapper";
import type { GovernedPhysicianReviewExperienceBuilderResult } from "./governed-physician-review-experience";

export async function getGovernedPhysicianReviewExperience(sessionId: string): Promise<GovernedPhysicianReviewExperienceBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianReviewExperience(sessionId);
  return mapGovernedPhysicianReviewExperienceEnvelope(envelope.data ?? envelope);
}

export type GovernedPhysicianReviewExperienceReadAdapter = { getGovernedPhysicianReviewExperience: typeof getGovernedPhysicianReviewExperience };
export const reviewExperienceReadAdapter: GovernedPhysicianReviewExperienceReadAdapter = { getGovernedPhysicianReviewExperience };
