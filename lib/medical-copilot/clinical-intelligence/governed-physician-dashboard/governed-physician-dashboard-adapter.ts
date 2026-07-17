import { getMedicalCopilotGovernedPhysicianDashboard } from "../../api";
import { mapGovernedPhysicianDashboardEnvelope } from "./governed-physician-dashboard-mapper";
import type { GovernedPhysicianDashboardResult } from "./governed-physician-dashboard";

export async function getGovernedPhysicianDashboard(
  sessionId: string,
): Promise<GovernedPhysicianDashboardResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianDashboard(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianDashboardEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianDashboardReadAdapter = {
  getGovernedPhysicianDashboard: typeof getGovernedPhysicianDashboard;
};

export const governedPhysicianDashboardReadAdapter: GovernedPhysicianDashboardReadAdapter = {
  getGovernedPhysicianDashboard,
};
