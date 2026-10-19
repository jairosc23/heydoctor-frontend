import { getMedicalCopilotGovernedClinicalOverview } from "../../api";
import { mapGovernedClinicalOverviewEnvelope } from "./governed-clinical-overview-mapper";
import type { GovernedClinicalOverviewResult } from "./governed-clinical-overview";

export async function getGovernedClinicalOverview(
  sessionId: string,
): Promise<GovernedClinicalOverviewResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalOverview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalOverviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalOverviewReadAdapter = {
  getGovernedClinicalOverview: typeof getGovernedClinicalOverview;
};

export const governedClinicalOverviewReadAdapter: GovernedClinicalOverviewReadAdapter = {
  getGovernedClinicalOverview,
};
