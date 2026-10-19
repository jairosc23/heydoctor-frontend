import { getMedicalCopilotGovernedPersistenceReadinessSession } from "../../api";
import { mapGovernedPersistenceReadinessSessionEnvelope } from "./governed-persistence-readiness-session-mapper";
import type { GovernedPersistenceReadinessSessionResult } from "./governed-persistence-readiness-session";

export async function getGovernedPersistenceReadinessSession(
  sessionId: string,
): Promise<GovernedPersistenceReadinessSessionResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessSession(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessSessionEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessSessionReadAdapter = {
  getGovernedPersistenceReadinessSession: typeof getGovernedPersistenceReadinessSession;
};

export const governedPersistenceReadinessSessionReadAdapter: GovernedPersistenceReadinessSessionReadAdapter = {
  getGovernedPersistenceReadinessSession,
};
