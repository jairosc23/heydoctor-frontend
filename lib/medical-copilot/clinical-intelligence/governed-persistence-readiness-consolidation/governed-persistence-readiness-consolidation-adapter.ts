import { getMedicalCopilotGovernedPersistenceReadinessConsolidation } from "../../api";
import { mapGovernedPersistenceReadinessConsolidationEnvelope } from "./governed-persistence-readiness-consolidation-mapper";
import type { GovernedPersistenceReadinessConsolidationResult } from "./governed-persistence-readiness-consolidation";

export async function getGovernedPersistenceReadinessConsolidation(
  sessionId: string,
): Promise<GovernedPersistenceReadinessConsolidationResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessConsolidation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessConsolidationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessConsolidationReadAdapter = {
  getGovernedPersistenceReadinessConsolidation: typeof getGovernedPersistenceReadinessConsolidation;
};

export const governedPersistenceReadinessConsolidationReadAdapter: GovernedPersistenceReadinessConsolidationReadAdapter = {
  getGovernedPersistenceReadinessConsolidation,
};
