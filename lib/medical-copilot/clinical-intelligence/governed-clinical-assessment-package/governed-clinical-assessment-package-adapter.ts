import { getMedicalCopilotGovernedClinicalAssessmentPackage } from "../../api";
import { mapGovernedClinicalAssessmentPackageEnvelope } from "./governed-clinical-assessment-package-mapper";
import type { GovernedClinicalAssessmentPackageBuilderResult } from "./governed-clinical-assessment-package";

export async function getGovernedClinicalAssessmentPackage(sessionId: string): Promise<GovernedClinicalAssessmentPackageBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalAssessmentPackage(sessionId);
  return mapGovernedClinicalAssessmentPackageEnvelope(envelope.data ?? envelope);
}

export type GovernedClinicalAssessmentPackageReadAdapter = { getGovernedClinicalAssessmentPackage: typeof getGovernedClinicalAssessmentPackage };
export const assessmentPackageReadAdapter: GovernedClinicalAssessmentPackageReadAdapter = { getGovernedClinicalAssessmentPackage };
