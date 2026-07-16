import { getMedicalCopilotGovernedPersistenceNavigation } from "../../api";
import { mapGovernedPersistenceNavigationEnvelope } from "./governed-persistence-navigation-mapper";
import type { GovernedPersistenceNavigationResult } from "./governed-persistence-navigation";

export async function getGovernedPersistenceNavigation(
  sessionId: string,
): Promise<GovernedPersistenceNavigationResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceNavigation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceNavigationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceNavigationReadAdapter = {
  getGovernedPersistenceNavigation: typeof getGovernedPersistenceNavigation;
};

export const governedPersistenceNavigationReadAdapter: GovernedPersistenceNavigationReadAdapter = {
  getGovernedPersistenceNavigation,
};
