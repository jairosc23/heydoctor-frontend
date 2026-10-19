import { getMedicalCopilotGovernedPersistenceSession } from "../../api";
import { mapGovernedPersistenceSessionEnvelope } from "./governed-persistence-session-mapper";
import type { GovernedPersistenceSessionResult } from "./governed-persistence-session";

export async function getGovernedPersistenceSession(
  sessionId: string,
): Promise<GovernedPersistenceSessionResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceSession(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceSessionEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceSessionReadAdapter = {
  getGovernedPersistenceSession: typeof getGovernedPersistenceSession;
};

export const governedPersistenceSessionReadAdapter: GovernedPersistenceSessionReadAdapter = {
  getGovernedPersistenceSession,
};
