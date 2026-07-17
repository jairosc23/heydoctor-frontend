import { getMedicalCopilotGovernedDraftComparisonWorkspace } from "../../api";
import { mapGovernedDraftComparisonWorkspaceEnvelope } from "./governed-draft-comparison-workspace-mapper";
import type { GovernedDraftComparisonWorkspaceResult } from "./governed-draft-comparison-workspace";

export async function getGovernedDraftComparisonWorkspace(
  sessionId: string,
): Promise<GovernedDraftComparisonWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedDraftComparisonWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedDraftComparisonWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedDraftComparisonWorkspaceReadAdapter = {
  getGovernedDraftComparisonWorkspace: typeof getGovernedDraftComparisonWorkspace;
};

export const governedDraftComparisonWorkspaceReadAdapter: GovernedDraftComparisonWorkspaceReadAdapter = {
  getGovernedDraftComparisonWorkspace,
};
