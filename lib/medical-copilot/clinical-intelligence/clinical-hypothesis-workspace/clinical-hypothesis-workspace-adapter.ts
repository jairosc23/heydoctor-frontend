import { getMedicalCopilotClinicalHypothesisWorkspace } from "../../api";
import { mapClinicalHypothesisWorkspaceEnvelope } from "./clinical-hypothesis-workspace-mapper";
import type { ClinicalHypothesisWorkspaceBuilderResult } from "./clinical-hypothesis-workspace";
export async function getClinicalHypothesisWorkspace(sessionId: string): Promise<ClinicalHypothesisWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalHypothesisWorkspace(sessionId);
  return mapClinicalHypothesisWorkspaceEnvelope(envelope.data ?? envelope);
}
export type ClinicalHypothesisWorkspaceReadAdapter = { getClinicalHypothesisWorkspace: typeof getClinicalHypothesisWorkspace };
export const clinicalHypothesisWorkspaceReadAdapter: ClinicalHypothesisWorkspaceReadAdapter = { getClinicalHypothesisWorkspace };
