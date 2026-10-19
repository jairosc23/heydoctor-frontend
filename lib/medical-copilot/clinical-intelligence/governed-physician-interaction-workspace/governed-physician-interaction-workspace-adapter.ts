import { getMedicalCopilotGovernedPhysicianInteractionWorkspace } from "../../api";
import { mapGovernedPhysicianInteractionWorkspaceEnvelope } from "./governed-physician-interaction-workspace-mapper";
import type { GovernedPhysicianInteractionWorkspaceResult } from "./governed-physician-interaction-workspace";

export async function getGovernedPhysicianInteractionWorkspace(
  sessionId: string,
): Promise<GovernedPhysicianInteractionWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianInteractionWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianInteractionWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianInteractionWorkspaceReadAdapter = {
  getGovernedPhysicianInteractionWorkspace: typeof getGovernedPhysicianInteractionWorkspace;
};

export const governedPhysicianInteractionWorkspaceReadAdapter: GovernedPhysicianInteractionWorkspaceReadAdapter = {
  getGovernedPhysicianInteractionWorkspace,
};
