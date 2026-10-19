import { getMedicalCopilotPhysicianDecisionWorkspace } from "../../api";
import { mapPhysicianDecisionWorkspaceEnvelope } from "./physician-decision-workspace-mapper";
import type { PhysicianDecisionWorkspaceBuilderResult } from "./physician-decision-workspace";

export async function getPhysicianDecisionWorkspace(sessionId: string): Promise<PhysicianDecisionWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianDecisionWorkspace(sessionId);
  return mapPhysicianDecisionWorkspaceEnvelope(envelope.data ?? envelope);
}

export type PhysicianDecisionWorkspaceReadAdapter = { getPhysicianDecisionWorkspace: typeof getPhysicianDecisionWorkspace };
export const decisionWorkspaceReadAdapter: PhysicianDecisionWorkspaceReadAdapter = { getPhysicianDecisionWorkspace };
