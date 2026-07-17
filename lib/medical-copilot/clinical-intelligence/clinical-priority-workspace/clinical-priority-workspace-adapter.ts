import { getMedicalCopilotClinicalPriorityWorkspace } from "../../api";
import { mapClinicalPriorityWorkspaceEnvelope } from "./clinical-priority-workspace-mapper";
import type { ClinicalPriorityWorkspaceBuilderResult } from "./clinical-priority-workspace";

export async function getClinicalPriorityWorkspace(sessionId: string): Promise<ClinicalPriorityWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalPriorityWorkspace(sessionId);
  return mapClinicalPriorityWorkspaceEnvelope(envelope.data ?? envelope);
}

export type ClinicalPriorityWorkspaceReadAdapter = { getClinicalPriorityWorkspace: typeof getClinicalPriorityWorkspace };
export const priorityWorkspaceReadAdapter: ClinicalPriorityWorkspaceReadAdapter = { getClinicalPriorityWorkspace };
