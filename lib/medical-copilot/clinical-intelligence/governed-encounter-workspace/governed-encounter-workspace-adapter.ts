import { getMedicalCopilotGovernedEncounterWorkspace } from "../../api";
import { mapGovernedEncounterWorkspaceEnvelope } from "./governed-encounter-workspace-mapper";
import type { GovernedEncounterWorkspaceResult } from "./governed-encounter-workspace";

export async function getGovernedEncounterWorkspace(
  sessionId: string,
): Promise<GovernedEncounterWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedEncounterWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedEncounterWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedEncounterWorkspaceReadAdapter = {
  getGovernedEncounterWorkspace: typeof getGovernedEncounterWorkspace;
};

export const governedEncounterWorkspaceReadAdapter: GovernedEncounterWorkspaceReadAdapter = {
  getGovernedEncounterWorkspace,
};
