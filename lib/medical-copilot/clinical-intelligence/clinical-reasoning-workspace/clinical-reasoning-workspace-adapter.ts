import { getMedicalCopilotClinicalReasoningWorkspace } from "../../api";
import { mapClinicalReasoningWorkspaceEnvelope } from "./clinical-reasoning-workspace-mapper";
import type { ClinicalReasoningWorkspaceBuilderResult } from "./clinical-reasoning-workspace";

export async function getClinicalReasoningWorkspace(sessionId: string): Promise<ClinicalReasoningWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningWorkspace(sessionId);
  return mapClinicalReasoningWorkspaceEnvelope(envelope.data ?? envelope);
}

export type ClinicalReasoningWorkspaceReadAdapter = { getClinicalReasoningWorkspace: typeof getClinicalReasoningWorkspace };
export const reasoningWorkspaceReadAdapter: ClinicalReasoningWorkspaceReadAdapter = { getClinicalReasoningWorkspace };
