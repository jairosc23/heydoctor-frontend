import { getMedicalCopilotGovernedClinicalValidationPackage } from "../../api";
import { mapGovernedClinicalValidationPackageEnvelope } from "./governed-clinical-validation-package-mapper";
import type { GovernedClinicalValidationPackageResult } from "./governed-clinical-validation-package";

export async function getGovernedClinicalValidationPackage(
  sessionId: string,
): Promise<GovernedClinicalValidationPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalValidationPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalValidationPackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalValidationPackageReadAdapter = {
  getGovernedClinicalValidationPackage: typeof getGovernedClinicalValidationPackage;
};

export const governedClinicalValidationPackageReadAdapter: GovernedClinicalValidationPackageReadAdapter = {
  getGovernedClinicalValidationPackage,
};
