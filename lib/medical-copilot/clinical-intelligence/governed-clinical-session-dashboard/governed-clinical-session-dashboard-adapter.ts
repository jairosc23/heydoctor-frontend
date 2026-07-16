import { getMedicalCopilotGovernedClinicalSessionDashboard } from "../../api";
import { mapGovernedClinicalSessionDashboardEnvelope } from "./governed-clinical-session-dashboard-mapper";
import type { GovernedClinicalSessionDashboardResult } from "./governed-clinical-session-dashboard";

export async function getGovernedClinicalSessionDashboard(
  sessionId: string,
): Promise<GovernedClinicalSessionDashboardResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalSessionDashboard(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalSessionDashboardEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalSessionDashboardReadAdapter = {
  getGovernedClinicalSessionDashboard: typeof getGovernedClinicalSessionDashboard;
};

export const governedClinicalSessionDashboardReadAdapter: GovernedClinicalSessionDashboardReadAdapter = {
  getGovernedClinicalSessionDashboard,
};
