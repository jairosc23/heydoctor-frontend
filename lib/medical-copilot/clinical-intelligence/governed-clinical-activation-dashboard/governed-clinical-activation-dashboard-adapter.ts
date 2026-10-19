import { getMedicalCopilotGovernedClinicalActivationDashboard } from "../../api";
import { mapGovernedClinicalActivationDashboardEnvelope } from "./governed-clinical-activation-dashboard-mapper";
import type { GovernedClinicalActivationDashboardResult } from "./governed-clinical-activation-dashboard";

export async function getGovernedClinicalActivationDashboard(
  sessionId: string,
): Promise<GovernedClinicalActivationDashboardResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationDashboard(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationDashboardEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationDashboardReadAdapter = {
  getGovernedClinicalActivationDashboard: typeof getGovernedClinicalActivationDashboard;
};

export const governedClinicalActivationDashboardReadAdapter: GovernedClinicalActivationDashboardReadAdapter = {
  getGovernedClinicalActivationDashboard,
};
