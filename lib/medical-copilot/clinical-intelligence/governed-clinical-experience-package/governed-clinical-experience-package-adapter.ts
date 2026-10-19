import { getMedicalCopilotGovernedClinicalExperiencePackage } from "../../api";
import { mapGovernedClinicalExperiencePackageEnvelope } from "./governed-clinical-experience-package-mapper";
import type { GovernedClinicalExperiencePackageResult } from "./governed-clinical-experience-package";

export async function getGovernedClinicalExperiencePackage(
  sessionId: string,
): Promise<GovernedClinicalExperiencePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalExperiencePackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalExperiencePackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalExperiencePackageReadAdapter = {
  getGovernedClinicalExperiencePackage: typeof getGovernedClinicalExperiencePackage;
};

export const governedClinicalExperiencePackageReadAdapter: GovernedClinicalExperiencePackageReadAdapter = {
  getGovernedClinicalExperiencePackage,
};
