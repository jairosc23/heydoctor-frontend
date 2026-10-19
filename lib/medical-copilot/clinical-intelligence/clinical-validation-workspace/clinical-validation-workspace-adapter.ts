import { getMedicalCopilotClinicalValidationWorkspace } from "../../api";
import { mapClinicalValidationWorkspaceEnvelope } from "./clinical-validation-workspace-mapper";
import type { ClinicalValidationWorkspaceBuilderResult } from "./clinical-validation-workspace";

export async function getClinicalValidationWorkspace(sessionId: string): Promise<ClinicalValidationWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalValidationWorkspace(sessionId);
  return mapClinicalValidationWorkspaceEnvelope(envelope.data ?? envelope);
}

export type ClinicalValidationWorkspaceReadAdapter = { getClinicalValidationWorkspace: typeof getClinicalValidationWorkspace };
export const validationWorkspaceReadAdapter: ClinicalValidationWorkspaceReadAdapter = { getClinicalValidationWorkspace };
