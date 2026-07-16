import { getMedicalCopilotDifferentialReviewWorkspace } from "../../api";
import { mapDifferentialReviewWorkspaceEnvelope } from "./differential-review-workspace-mapper";
import type { DifferentialReviewWorkspaceBuilderResult } from "./differential-review-workspace";

export async function getDifferentialReviewWorkspace(sessionId: string): Promise<DifferentialReviewWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotDifferentialReviewWorkspace(sessionId);
  return mapDifferentialReviewWorkspaceEnvelope(envelope.data ?? envelope);
}

export type DifferentialReviewWorkspaceReadAdapter = { getDifferentialReviewWorkspace: typeof getDifferentialReviewWorkspace };
export const differentialReviewReadAdapter: DifferentialReviewWorkspaceReadAdapter = { getDifferentialReviewWorkspace };
