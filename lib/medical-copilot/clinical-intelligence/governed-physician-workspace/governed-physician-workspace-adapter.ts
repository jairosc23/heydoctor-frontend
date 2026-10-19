import { getMedicalCopilotGovernedPhysicianWorkspace } from "../../api";
import { mapGovernedPhysicianWorkspaceEnvelope } from "./governed-physician-workspace-mapper";
import type { GovernedPhysicianWorkspaceResult } from "./governed-physician-workspace";

export async function getGovernedPhysicianWorkspace(
  sessionId: string,
): Promise<GovernedPhysicianWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianWorkspaceReadAdapter = {
  getGovernedPhysicianWorkspace: typeof getGovernedPhysicianWorkspace;
};

export const governedPhysicianWorkspaceReadAdapter: GovernedPhysicianWorkspaceReadAdapter = {
  getGovernedPhysicianWorkspace,
};
