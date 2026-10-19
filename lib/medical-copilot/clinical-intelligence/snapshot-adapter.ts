/**
 * CI-6 — Read adapter for Clinical Copilot Snapshot (Facade only).
 */

import { getMedicalCopilotClinicalCopilotSnapshot } from "../api";
import { mapSnapshotEnvelope } from "./snapshot-mapper";
import type { ClinicalCopilotSnapshotResult } from "./snapshot";

export async function getClinicalCopilotSnapshot(
  sessionId: string,
): Promise<ClinicalCopilotSnapshotResult | null> {
  const envelope = await getMedicalCopilotClinicalCopilotSnapshot(sessionId);
  return mapSnapshotEnvelope(envelope.data ?? envelope);
}

export type ClinicalCopilotSnapshotReadAdapter = {
  getClinicalCopilotSnapshot: typeof getClinicalCopilotSnapshot;
};

export const clinicalCopilotSnapshotReadAdapter: ClinicalCopilotSnapshotReadAdapter =
  {
    getClinicalCopilotSnapshot,
  };
