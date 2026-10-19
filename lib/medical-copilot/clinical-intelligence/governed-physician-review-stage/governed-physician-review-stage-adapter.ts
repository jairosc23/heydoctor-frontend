import { getMedicalCopilotGovernedPhysicianReviewStage } from "../../api";
import { mapGovernedPhysicianReviewStageEnvelope } from "./governed-physician-review-stage-mapper";
import type { GovernedPhysicianReviewStageResult } from "./governed-physician-review-stage";
export async function getGovernedPhysicianReviewStage(sessionId: string): Promise<GovernedPhysicianReviewStageResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianReviewStage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPhysicianReviewStageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedPhysicianReviewStageReadAdapter = { getGovernedPhysicianReviewStage: typeof getGovernedPhysicianReviewStage };
export const governedPhysicianReviewStageReadAdapter: GovernedPhysicianReviewStageReadAdapter = { getGovernedPhysicianReviewStage };
