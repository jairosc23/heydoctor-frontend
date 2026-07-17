import { getMedicalCopilotGovernedClinicalNavigation } from "../../api";
import { mapGovernedClinicalNavigationEnvelope } from "./governed-clinical-navigation-mapper";
import type { GovernedClinicalNavigationResult } from "./governed-clinical-navigation";

export async function getGovernedClinicalNavigation(
  sessionId: string,
): Promise<GovernedClinicalNavigationResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalNavigation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalNavigationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalNavigationReadAdapter = {
  getGovernedClinicalNavigation: typeof getGovernedClinicalNavigation;
};

export const governedClinicalNavigationReadAdapter: GovernedClinicalNavigationReadAdapter = {
  getGovernedClinicalNavigation,
};
