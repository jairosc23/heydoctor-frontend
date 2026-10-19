import { getMedicalCopilotPhysicianReviewWorkspaceV2 } from "../../api";
import { mapPhysicianReviewWorkspaceV2Envelope } from "./physician-review-workspace-v2-mapper";
import type { PhysicianReviewWorkspaceV2BuilderResult } from "./physician-review-workspace-v2";

export async function getPhysicianReviewWorkspaceV2(sessionId: string): Promise<PhysicianReviewWorkspaceV2BuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianReviewWorkspaceV2(sessionId);
  return mapPhysicianReviewWorkspaceV2Envelope(envelope.data ?? envelope);
}

export type PhysicianReviewWorkspaceV2ReadAdapter = { getPhysicianReviewWorkspaceV2: typeof getPhysicianReviewWorkspaceV2 };
export const reviewWorkspaceV2ReadAdapter: PhysicianReviewWorkspaceV2ReadAdapter = { getPhysicianReviewWorkspaceV2 };
