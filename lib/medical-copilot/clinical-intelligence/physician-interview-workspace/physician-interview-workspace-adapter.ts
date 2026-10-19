import { getMedicalCopilotPhysicianInterviewWorkspace } from "../../api";
import { mapPhysicianInterviewWorkspaceEnvelope } from "./physician-interview-workspace-mapper";
import type { PhysicianInterviewWorkspaceBuilderResult } from "./physician-interview-workspace";

export async function getPhysicianInterviewWorkspace(sessionId: string): Promise<PhysicianInterviewWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianInterviewWorkspace(sessionId);
  return mapPhysicianInterviewWorkspaceEnvelope(envelope.data ?? envelope);
}

export type PhysicianInterviewWorkspaceReadAdapter = { getPhysicianInterviewWorkspace: typeof getPhysicianInterviewWorkspace };
export const interviewWorkspaceReadAdapter: PhysicianInterviewWorkspaceReadAdapter = { getPhysicianInterviewWorkspace };
