import { getMedicalCopilotGovernedClinicalExecutionPackage } from "../../api";
import { mapGovernedClinicalExecutionPackageEnvelope } from "./governed-clinical-execution-package-mapper";
import type { GovernedClinicalExecutionPackageResult } from "./governed-clinical-execution-package";

export async function getGovernedClinicalExecutionPackage(
  sessionId: string,
): Promise<GovernedClinicalExecutionPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalExecutionPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalExecutionPackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalExecutionPackageReadAdapter = {
  getGovernedClinicalExecutionPackage: typeof getGovernedClinicalExecutionPackage;
};

export const governedClinicalExecutionPackageReadAdapter: GovernedClinicalExecutionPackageReadAdapter = {
  getGovernedClinicalExecutionPackage,
};
