import { getMedicalCopilotGovernedClinicalWorkspace } from "../../api";
import { mapGovernedClinicalWorkspaceEnvelope } from "./governed-clinical-workspace-mapper";
import type { GovernedClinicalWorkspaceResult } from "./governed-clinical-workspace";

export async function getGovernedClinicalWorkspace(
  sessionId: string,
): Promise<GovernedClinicalWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalWorkspaceReadAdapter = {
  getGovernedClinicalWorkspace: typeof getGovernedClinicalWorkspace;
};

export const governedClinicalWorkspaceReadAdapter: GovernedClinicalWorkspaceReadAdapter = {
  getGovernedClinicalWorkspace,
};
