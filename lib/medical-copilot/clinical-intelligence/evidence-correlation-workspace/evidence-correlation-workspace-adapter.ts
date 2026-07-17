import { getMedicalCopilotEvidenceCorrelationWorkspace } from "../../api";
import { mapEvidenceCorrelationWorkspaceEnvelope } from "./evidence-correlation-workspace-mapper";
import type { EvidenceCorrelationWorkspaceBuilderResult } from "./evidence-correlation-workspace";

export async function getEvidenceCorrelationWorkspace(sessionId: string): Promise<EvidenceCorrelationWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotEvidenceCorrelationWorkspace(sessionId);
  return mapEvidenceCorrelationWorkspaceEnvelope(envelope.data ?? envelope);
}

export type EvidenceCorrelationWorkspaceReadAdapter = { getEvidenceCorrelationWorkspace: typeof getEvidenceCorrelationWorkspace };
export const evidenceCorrelationReadAdapter: EvidenceCorrelationWorkspaceReadAdapter = { getEvidenceCorrelationWorkspace };
