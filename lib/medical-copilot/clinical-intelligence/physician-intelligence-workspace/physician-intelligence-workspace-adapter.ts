import { getMedicalCopilotPhysicianIntelligenceWorkspace } from "../../api";
import { mapPhysicianIntelligenceWorkspaceEnvelope } from "./physician-intelligence-workspace-mapper";
import type { PhysicianIntelligenceWorkspaceBuilderResult } from "./physician-intelligence-workspace";
export async function getPhysicianIntelligenceWorkspace(sessionId: string): Promise<PhysicianIntelligenceWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianIntelligenceWorkspace(sessionId);
  return mapPhysicianIntelligenceWorkspaceEnvelope(envelope.data ?? envelope);
}
export type PhysicianIntelligenceWorkspaceReadAdapter = { getPhysicianIntelligenceWorkspace: typeof getPhysicianIntelligenceWorkspace };
export const physicianIntelligenceWorkspaceReadAdapter: PhysicianIntelligenceWorkspaceReadAdapter = { getPhysicianIntelligenceWorkspace };
