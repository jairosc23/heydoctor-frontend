import { getMedicalCopilotGovernedClinicalDocumentationPackage } from "../../api";
import { mapGovernedClinicalDocumentationPackageEnvelope } from "./governed-clinical-documentation-package-mapper";
import type { GovernedClinicalDocumentationPackageResult } from "./governed-clinical-documentation-package";

export async function getGovernedClinicalDocumentationPackage(
  sessionId: string,
): Promise<GovernedClinicalDocumentationPackageResult | null> {
  const envelope =
    await getMedicalCopilotGovernedClinicalDocumentationPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalDocumentationPackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalDocumentationPackageReadAdapter = {
  getGovernedClinicalDocumentationPackage: typeof getGovernedClinicalDocumentationPackage;
};

export const governedClinicalDocumentationPackageReadAdapter: GovernedClinicalDocumentationPackageReadAdapter =
  { getGovernedClinicalDocumentationPackage };
