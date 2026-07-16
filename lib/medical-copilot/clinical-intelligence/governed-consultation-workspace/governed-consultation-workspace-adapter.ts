import { getMedicalCopilotGovernedConsultationWorkspace } from "../../api";
import { mapGovernedConsultationWorkspaceEnvelope } from "./governed-consultation-workspace-mapper";
import type { GovernedConsultationWorkspaceResult } from "./governed-consultation-workspace";

export async function getGovernedConsultationWorkspace(
  sessionId: string,
): Promise<GovernedConsultationWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationWorkspaceReadAdapter = {
  getGovernedConsultationWorkspace: typeof getGovernedConsultationWorkspace;
};

export const governedConsultationWorkspaceReadAdapter: GovernedConsultationWorkspaceReadAdapter = {
  getGovernedConsultationWorkspace,
};
