import { getMedicalCopilotGovernedPersistencePreview } from "../../api";
import { mapGovernedPersistencePreviewEnvelope } from "./governed-persistence-preview-mapper";
import type { GovernedPersistencePreviewResult } from "./governed-persistence-preview";

export async function getGovernedPersistencePreview(
  sessionId: string,
): Promise<GovernedPersistencePreviewResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistencePreview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistencePreviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistencePreviewReadAdapter = {
  getGovernedPersistencePreview: typeof getGovernedPersistencePreview;
};

export const governedPersistencePreviewReadAdapter: GovernedPersistencePreviewReadAdapter = {
  getGovernedPersistencePreview,
};
