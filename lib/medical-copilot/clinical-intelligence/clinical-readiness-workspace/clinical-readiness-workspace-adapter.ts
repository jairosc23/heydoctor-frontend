import { getMedicalCopilotClinicalReadinessWorkspace } from "../../api";
import { mapClinicalReadinessWorkspaceEnvelope } from "./clinical-readiness-workspace-mapper";
import type { ClinicalReadinessWorkspaceBuilderResult } from "./clinical-readiness-workspace";

export async function getClinicalReadinessWorkspace(sessionId: string): Promise<ClinicalReadinessWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReadinessWorkspace(sessionId);
  return mapClinicalReadinessWorkspaceEnvelope(envelope.data ?? envelope);
}

export type ClinicalReadinessWorkspaceReadAdapter = { getClinicalReadinessWorkspace: typeof getClinicalReadinessWorkspace };
export const readinessWorkspaceReadAdapter: ClinicalReadinessWorkspaceReadAdapter = { getClinicalReadinessWorkspace };
