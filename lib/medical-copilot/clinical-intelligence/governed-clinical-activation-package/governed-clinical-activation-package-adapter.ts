import { getMedicalCopilotGovernedClinicalActivationPackage } from "../../api";
import { mapGovernedClinicalActivationPackageEnvelope } from "./governed-clinical-activation-package-mapper";
import type { GovernedClinicalActivationPackageResult } from "./governed-clinical-activation-package";

export async function getGovernedClinicalActivationPackage(
  sessionId: string,
): Promise<GovernedClinicalActivationPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationPackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationPackageReadAdapter = {
  getGovernedClinicalActivationPackage: typeof getGovernedClinicalActivationPackage;
};

export const governedClinicalActivationPackageReadAdapter: GovernedClinicalActivationPackageReadAdapter = {
  getGovernedClinicalActivationPackage,
};
