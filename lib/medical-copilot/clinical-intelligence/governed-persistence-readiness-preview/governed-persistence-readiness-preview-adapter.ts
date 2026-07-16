import { getMedicalCopilotGovernedPersistenceReadinessPreview } from "../../api";
import { mapGovernedPersistenceReadinessPreviewEnvelope } from "./governed-persistence-readiness-preview-mapper";
import type { GovernedPersistenceReadinessPreviewResult } from "./governed-persistence-readiness-preview";

export async function getGovernedPersistenceReadinessPreview(
  sessionId: string,
): Promise<GovernedPersistenceReadinessPreviewResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessPreview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessPreviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessPreviewReadAdapter = {
  getGovernedPersistenceReadinessPreview: typeof getGovernedPersistenceReadinessPreview;
};

export const governedPersistenceReadinessPreviewReadAdapter: GovernedPersistenceReadinessPreviewReadAdapter = {
  getGovernedPersistenceReadinessPreview,
};
