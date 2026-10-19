import { getMedicalCopilotGovernedConsultationDashboard } from "../../api";
import { mapGovernedConsultationDashboardEnvelope } from "./governed-consultation-dashboard-mapper";
import type { GovernedConsultationDashboardResult } from "./governed-consultation-dashboard";

export async function getGovernedConsultationDashboard(
  sessionId: string,
): Promise<GovernedConsultationDashboardResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationDashboard(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationDashboardEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationDashboardReadAdapter = {
  getGovernedConsultationDashboard: typeof getGovernedConsultationDashboard;
};

export const governedConsultationDashboardReadAdapter: GovernedConsultationDashboardReadAdapter = {
  getGovernedConsultationDashboard,
};
