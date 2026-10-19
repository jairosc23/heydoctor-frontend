import { getMedicalCopilotGovernedClinicalDashboard } from "../../api";
import { mapGovernedClinicalDashboardEnvelope } from "./governed-clinical-dashboard-mapper";
import type { GovernedClinicalDashboardResult } from "./governed-clinical-dashboard";

export async function getGovernedClinicalDashboard(
  sessionId: string,
): Promise<GovernedClinicalDashboardResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalDashboard(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalDashboardEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalDashboardReadAdapter = {
  getGovernedClinicalDashboard: typeof getGovernedClinicalDashboard;
};

export const governedClinicalDashboardReadAdapter: GovernedClinicalDashboardReadAdapter = {
  getGovernedClinicalDashboard,
};
