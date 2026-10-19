import { getMedicalCopilotGovernedClinicalWorkspaceSnapshot } from "../../api";
import { mapGovernedClinicalWorkspaceSnapshotEnvelope } from "./governed-clinical-workspace-snapshot-mapper";
import type { GovernedClinicalWorkspaceSnapshotResult } from "./governed-clinical-workspace-snapshot";

export async function getGovernedClinicalWorkspaceSnapshot(
  sessionId: string,
): Promise<GovernedClinicalWorkspaceSnapshotResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalWorkspaceSnapshot(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalWorkspaceSnapshotEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalWorkspaceSnapshotReadAdapter = {
  getGovernedClinicalWorkspaceSnapshot: typeof getGovernedClinicalWorkspaceSnapshot;
};

export const governedClinicalWorkspaceSnapshotReadAdapter: GovernedClinicalWorkspaceSnapshotReadAdapter = {
  getGovernedClinicalWorkspaceSnapshot,
};
