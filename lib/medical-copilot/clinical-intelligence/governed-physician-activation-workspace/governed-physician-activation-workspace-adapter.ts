import { getMedicalCopilotGovernedPhysicianActivationWorkspace } from "../../api";
import { mapGovernedPhysicianActivationWorkspaceEnvelope } from "./governed-physician-activation-workspace-mapper";
import type { GovernedPhysicianActivationWorkspaceResult } from "./governed-physician-activation-workspace";

export async function getGovernedPhysicianActivationWorkspace(
  sessionId: string,
): Promise<GovernedPhysicianActivationWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianActivationWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianActivationWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianActivationWorkspaceReadAdapter = {
  getGovernedPhysicianActivationWorkspace: typeof getGovernedPhysicianActivationWorkspace;
};

export const governedPhysicianActivationWorkspaceReadAdapter: GovernedPhysicianActivationWorkspaceReadAdapter = {
  getGovernedPhysicianActivationWorkspace,
};
