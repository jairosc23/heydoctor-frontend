import { getMedicalCopilotEvidenceRankingWorkspace } from "../../api";
import { mapEvidenceRankingWorkspaceEnvelope } from "./evidence-ranking-workspace-mapper";
import type { EvidenceRankingWorkspaceBuilderResult } from "./evidence-ranking-workspace";
export async function getEvidenceRankingWorkspace(sessionId: string): Promise<EvidenceRankingWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotEvidenceRankingWorkspace(sessionId);
  return mapEvidenceRankingWorkspaceEnvelope(envelope.data ?? envelope);
}
export type EvidenceRankingWorkspaceReadAdapter = { getEvidenceRankingWorkspace: typeof getEvidenceRankingWorkspace };
export const evidenceRankingWorkspaceReadAdapter: EvidenceRankingWorkspaceReadAdapter = { getEvidenceRankingWorkspace };
