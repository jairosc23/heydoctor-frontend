import { getMedicalCopilotGovernedPersistenceDashboard } from "../../api";
import { mapGovernedPersistenceDashboardEnvelope } from "./governed-persistence-dashboard-mapper";
import type { GovernedPersistenceDashboardResult } from "./governed-persistence-dashboard";

export async function getGovernedPersistenceDashboard(
  sessionId: string,
): Promise<GovernedPersistenceDashboardResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceDashboard(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceDashboardEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceDashboardReadAdapter = {
  getGovernedPersistenceDashboard: typeof getGovernedPersistenceDashboard;
};

export const governedPersistenceDashboardReadAdapter: GovernedPersistenceDashboardReadAdapter = {
  getGovernedPersistenceDashboard,
};
