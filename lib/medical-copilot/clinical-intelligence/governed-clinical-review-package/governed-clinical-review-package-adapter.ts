import { getMedicalCopilotGovernedClinicalReviewPackage } from "../../api";
import { mapGovernedClinicalReviewPackageEnvelope } from "./governed-clinical-review-package-mapper";
import type { GovernedClinicalReviewPackageResult } from "./governed-clinical-review-package";

export async function getGovernedClinicalReviewPackage(
  sessionId: string,
): Promise<GovernedClinicalReviewPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalReviewPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalReviewPackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalReviewPackageReadAdapter = {
  getGovernedClinicalReviewPackage: typeof getGovernedClinicalReviewPackage;
};

export const governedClinicalReviewPackageReadAdapter: GovernedClinicalReviewPackageReadAdapter = {
  getGovernedClinicalReviewPackage,
};
