import { getMedicalCopilotGovernedClinicalActivationWorkspace } from "../../api";
import { mapGovernedClinicalActivationWorkspaceEnvelope } from "./governed-clinical-activation-workspace-mapper";
import type { GovernedClinicalActivationWorkspaceResult } from "./governed-clinical-activation-workspace";

export async function getGovernedClinicalActivationWorkspace(
  sessionId: string,
): Promise<GovernedClinicalActivationWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationWorkspaceReadAdapter = {
  getGovernedClinicalActivationWorkspace: typeof getGovernedClinicalActivationWorkspace;
};

export const governedClinicalActivationWorkspaceReadAdapter: GovernedClinicalActivationWorkspaceReadAdapter = {
  getGovernedClinicalActivationWorkspace,
};
