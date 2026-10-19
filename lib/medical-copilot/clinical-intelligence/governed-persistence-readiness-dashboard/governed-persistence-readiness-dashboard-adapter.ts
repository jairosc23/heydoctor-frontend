import { getMedicalCopilotGovernedPersistenceReadinessDashboard } from "../../api";
import { mapGovernedPersistenceReadinessDashboardEnvelope } from "./governed-persistence-readiness-dashboard-mapper";
import type { GovernedPersistenceReadinessDashboardResult } from "./governed-persistence-readiness-dashboard";

export async function getGovernedPersistenceReadinessDashboard(
  sessionId: string,
): Promise<GovernedPersistenceReadinessDashboardResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessDashboard(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessDashboardEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessDashboardReadAdapter = {
  getGovernedPersistenceReadinessDashboard: typeof getGovernedPersistenceReadinessDashboard;
};

export const governedPersistenceReadinessDashboardReadAdapter: GovernedPersistenceReadinessDashboardReadAdapter = {
  getGovernedPersistenceReadinessDashboard,
};
