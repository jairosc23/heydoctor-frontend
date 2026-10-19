import { getMedicalCopilotGovernedPhysicianSession } from "../../api";
import { mapGovernedPhysicianSessionEnvelope } from "./governed-physician-session-mapper";
import type { GovernedPhysicianSessionResult } from "./governed-physician-session";

export async function getGovernedPhysicianSession(
  sessionId: string,
): Promise<GovernedPhysicianSessionResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianSession(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianSessionEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianSessionReadAdapter = {
  getGovernedPhysicianSession: typeof getGovernedPhysicianSession;
};

export const governedPhysicianSessionReadAdapter: GovernedPhysicianSessionReadAdapter = {
  getGovernedPhysicianSession,
};
