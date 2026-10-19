import { getMedicalCopilotDiagnosticEvidenceWorkspace } from "../../api";
import { mapDiagnosticEvidenceWorkspaceEnvelope } from "./diagnostic-evidence-workspace-mapper";
import type { DiagnosticEvidenceWorkspaceBuilderResult } from "./diagnostic-evidence-workspace";

export async function getDiagnosticEvidenceWorkspace(sessionId: string): Promise<DiagnosticEvidenceWorkspaceBuilderResult | null> {
  const envelope = await getMedicalCopilotDiagnosticEvidenceWorkspace(sessionId);
  return mapDiagnosticEvidenceWorkspaceEnvelope(envelope.data ?? envelope);
}

export type DiagnosticEvidenceWorkspaceReadAdapter = { getDiagnosticEvidenceWorkspace: typeof getDiagnosticEvidenceWorkspace };
export const evidenceWorkspaceReadAdapter: DiagnosticEvidenceWorkspaceReadAdapter = { getDiagnosticEvidenceWorkspace };
