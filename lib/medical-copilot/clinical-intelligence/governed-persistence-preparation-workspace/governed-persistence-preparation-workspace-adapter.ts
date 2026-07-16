import { getMedicalCopilotGovernedPersistencePreparationWorkspace } from "../../api";
import { mapGovernedPersistencePreparationWorkspaceEnvelope } from "./governed-persistence-preparation-workspace-mapper";
import type { GovernedPersistencePreparationWorkspaceResult } from "./governed-persistence-preparation-workspace";

export async function getGovernedPersistencePreparationWorkspace(
  sessionId: string,
): Promise<GovernedPersistencePreparationWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistencePreparationWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistencePreparationWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistencePreparationWorkspaceReadAdapter = {
  getGovernedPersistencePreparationWorkspace: typeof getGovernedPersistencePreparationWorkspace;
};

export const governedPersistencePreparationWorkspaceReadAdapter: GovernedPersistencePreparationWorkspaceReadAdapter = {
  getGovernedPersistencePreparationWorkspace,
};
