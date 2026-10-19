import { getMedicalCopilotGovernedClinicalActivationNavigation } from "../../api";
import { mapGovernedClinicalActivationNavigationEnvelope } from "./governed-clinical-activation-navigation-mapper";
import type { GovernedClinicalActivationNavigationResult } from "./governed-clinical-activation-navigation";

export async function getGovernedClinicalActivationNavigation(
  sessionId: string,
): Promise<GovernedClinicalActivationNavigationResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationNavigation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationNavigationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationNavigationReadAdapter = {
  getGovernedClinicalActivationNavigation: typeof getGovernedClinicalActivationNavigation;
};

export const governedClinicalActivationNavigationReadAdapter: GovernedClinicalActivationNavigationReadAdapter = {
  getGovernedClinicalActivationNavigation,
};
