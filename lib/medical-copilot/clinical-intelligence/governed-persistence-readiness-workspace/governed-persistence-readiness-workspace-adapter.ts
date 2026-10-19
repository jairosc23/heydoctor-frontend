import { getMedicalCopilotGovernedPersistenceReadinessWorkspace } from "../../api";
import { mapGovernedPersistenceReadinessWorkspaceEnvelope } from "./governed-persistence-readiness-workspace-mapper";
import type { GovernedPersistenceReadinessWorkspaceResult } from "./governed-persistence-readiness-workspace";

export async function getGovernedPersistenceReadinessWorkspace(
  sessionId: string,
): Promise<GovernedPersistenceReadinessWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessWorkspaceReadAdapter = {
  getGovernedPersistenceReadinessWorkspace: typeof getGovernedPersistenceReadinessWorkspace;
};

export const governedPersistenceReadinessWorkspaceReadAdapter: GovernedPersistenceReadinessWorkspaceReadAdapter = {
  getGovernedPersistenceReadinessWorkspace,
};
