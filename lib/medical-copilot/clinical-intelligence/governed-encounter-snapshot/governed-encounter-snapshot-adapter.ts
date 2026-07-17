import { getMedicalCopilotGovernedEncounterSnapshot } from "../../api";
import { mapGovernedEncounterSnapshotEnvelope } from "./governed-encounter-snapshot-mapper";
import type { GovernedEncounterSnapshotResult } from "./governed-encounter-snapshot";

export async function getGovernedEncounterSnapshot(
  sessionId: string,
): Promise<GovernedEncounterSnapshotResult | null> {
  const envelope = await getMedicalCopilotGovernedEncounterSnapshot(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedEncounterSnapshotEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedEncounterSnapshotReadAdapter = {
  getGovernedEncounterSnapshot: typeof getGovernedEncounterSnapshot;
};

export const governedEncounterSnapshotReadAdapter: GovernedEncounterSnapshotReadAdapter = {
  getGovernedEncounterSnapshot,
};
