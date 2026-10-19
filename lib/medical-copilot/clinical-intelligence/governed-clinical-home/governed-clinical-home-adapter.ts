import { getMedicalCopilotGovernedClinicalHome } from "../../api";
import { mapGovernedClinicalHomeEnvelope } from "./governed-clinical-home-mapper";
import type { GovernedClinicalHomeResult } from "./governed-clinical-home";

export async function getGovernedClinicalHome(
  sessionId: string,
): Promise<GovernedClinicalHomeResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalHome(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalHomeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalHomeReadAdapter = {
  getGovernedClinicalHome: typeof getGovernedClinicalHome;
};

export const governedClinicalHomeReadAdapter: GovernedClinicalHomeReadAdapter = {
  getGovernedClinicalHome,
};
