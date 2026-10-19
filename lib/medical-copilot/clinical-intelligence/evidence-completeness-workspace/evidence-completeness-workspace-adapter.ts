import { getMedicalCopilotEvidenceCompletenessWorkspace } from "../../api";
import { mapEvidenceCompletenessWorkspaceEnvelope } from "./evidence-completeness-workspace-mapper";
import type { EvidenceCompletenessWorkspaceBuilderResult } from "./evidence-completeness-workspace";

export async function getEvidenceCompletenessWorkspace(sessionId: string): Promise<EvidenceCompletenessWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotEvidenceCompletenessWorkspace(sessionId);
  return mapEvidenceCompletenessWorkspaceEnvelope(envelope.data ?? envelope);
}

export type EvidenceCompletenessWorkspaceReadAdapter = { getEvidenceCompletenessWorkspace: typeof getEvidenceCompletenessWorkspace };
export const evidenceCompletenessReadAdapter: EvidenceCompletenessWorkspaceReadAdapter = { getEvidenceCompletenessWorkspace };
