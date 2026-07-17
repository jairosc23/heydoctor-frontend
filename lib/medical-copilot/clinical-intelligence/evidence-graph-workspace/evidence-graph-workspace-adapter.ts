import { getMedicalCopilotEvidenceGraphWorkspace } from "../../api";
import { mapEvidenceGraphWorkspaceEnvelope } from "./evidence-graph-workspace-mapper";
import type { EvidenceGraphWorkspaceBuilderResult } from "./evidence-graph-workspace";
export async function getEvidenceGraphWorkspace(sessionId: string): Promise<EvidenceGraphWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotEvidenceGraphWorkspace(sessionId);
  return mapEvidenceGraphWorkspaceEnvelope(envelope.data ?? envelope);
}
export type EvidenceGraphWorkspaceReadAdapter = { getEvidenceGraphWorkspace: typeof getEvidenceGraphWorkspace };
export const evidenceGraphReadAdapter: EvidenceGraphWorkspaceReadAdapter = { getEvidenceGraphWorkspace };
