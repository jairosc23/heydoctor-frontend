import { getMedicalCopilotClinicalPatternWorkspace } from "../../api";
import { mapClinicalPatternWorkspaceEnvelope } from "./clinical-pattern-workspace-mapper";
import type { ClinicalPatternWorkspaceBuilderResult } from "./clinical-pattern-workspace";

export async function getClinicalPatternWorkspace(sessionId: string): Promise<ClinicalPatternWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalPatternWorkspace(sessionId);
  return mapClinicalPatternWorkspaceEnvelope(envelope.data ?? envelope);
}

export type ClinicalPatternWorkspaceReadAdapter = { getClinicalPatternWorkspace: typeof getClinicalPatternWorkspace };
export const clinicalPatternReadAdapter: ClinicalPatternWorkspaceReadAdapter = { getClinicalPatternWorkspace };
