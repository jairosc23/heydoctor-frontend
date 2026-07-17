import { getMedicalCopilotGovernedConsultationSnapshot } from "../../api";
import { mapGovernedConsultationSnapshotEnvelope } from "./governed-consultation-snapshot-mapper";
import type { GovernedConsultationSnapshotResult } from "./governed-consultation-snapshot";

export async function getGovernedConsultationSnapshot(
  sessionId: string,
): Promise<GovernedConsultationSnapshotResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationSnapshot(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationSnapshotEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationSnapshotReadAdapter = {
  getGovernedConsultationSnapshot: typeof getGovernedConsultationSnapshot;
};

export const governedConsultationSnapshotReadAdapter: GovernedConsultationSnapshotReadAdapter = {
  getGovernedConsultationSnapshot,
};
