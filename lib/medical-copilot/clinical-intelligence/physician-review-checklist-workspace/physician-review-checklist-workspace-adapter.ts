import { getMedicalCopilotPhysicianReviewChecklistWorkspace } from "../../api";
import { mapPhysicianReviewChecklistWorkspaceEnvelope } from "./physician-review-checklist-workspace-mapper";
import type { PhysicianReviewChecklistWorkspaceBuilderResult } from "./physician-review-checklist-workspace";

export async function getPhysicianReviewChecklistWorkspace(sessionId: string): Promise<PhysicianReviewChecklistWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianReviewChecklistWorkspace(sessionId);
  return mapPhysicianReviewChecklistWorkspaceEnvelope(envelope.data ?? envelope);
}

export type PhysicianReviewChecklistWorkspaceReadAdapter = { getPhysicianReviewChecklistWorkspace: typeof getPhysicianReviewChecklistWorkspace };
export const checklistWorkspaceReadAdapter: PhysicianReviewChecklistWorkspaceReadAdapter = { getPhysicianReviewChecklistWorkspace };
