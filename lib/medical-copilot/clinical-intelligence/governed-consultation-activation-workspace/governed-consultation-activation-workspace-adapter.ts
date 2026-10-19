import { getMedicalCopilotGovernedConsultationActivationWorkspace } from "../../api";
import { mapGovernedConsultationActivationWorkspaceEnvelope } from "./governed-consultation-activation-workspace-mapper";
import type { GovernedConsultationActivationWorkspaceResult } from "./governed-consultation-activation-workspace";

export async function getGovernedConsultationActivationWorkspace(
  sessionId: string,
): Promise<GovernedConsultationActivationWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationActivationWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationActivationWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationActivationWorkspaceReadAdapter = {
  getGovernedConsultationActivationWorkspace: typeof getGovernedConsultationActivationWorkspace;
};

export const governedConsultationActivationWorkspaceReadAdapter: GovernedConsultationActivationWorkspaceReadAdapter = {
  getGovernedConsultationActivationWorkspace,
};
