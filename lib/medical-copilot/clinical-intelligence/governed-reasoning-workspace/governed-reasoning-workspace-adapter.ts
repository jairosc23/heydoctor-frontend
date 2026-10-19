import { getMedicalCopilotGovernedReasoningWorkspace } from "../../api";
import { mapGovernedReasoningWorkspaceEnvelope } from "./governed-reasoning-workspace-mapper";
import type { GovernedReasoningWorkspaceBuilderResult } from "./governed-reasoning-workspace";

export async function getGovernedReasoningWorkspace(sessionId: string): Promise<GovernedReasoningWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedReasoningWorkspace(sessionId);
  return mapGovernedReasoningWorkspaceEnvelope(envelope.data ?? envelope);
}

export type GovernedReasoningWorkspaceReadAdapter = { getGovernedReasoningWorkspace: typeof getGovernedReasoningWorkspace };
export const governedReasoningReadAdapter: GovernedReasoningWorkspaceReadAdapter = { getGovernedReasoningWorkspace };
