import { getMedicalCopilotGovernedClinicalDecisionSystemPackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalDecisionSystemPackageEnvelope } from "./governed-clinical-decision-system-package-mapper";
import type { GovernedClinicalDecisionSystemPackageResult } from "./governed-clinical-decision-system-package";
export type GovernedClinicalDecisionSystemPackageReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalDecisionSystemPackageResult | null> };
export async function getGovernedClinicalDecisionSystemPackage(sessionId: string): Promise<GovernedClinicalDecisionSystemPackageResult | null> {
  return mapGovernedClinicalDecisionSystemPackageEnvelope(await getMedicalCopilotGovernedClinicalDecisionSystemPackage(sessionId));
}
export const governedClinicalDecisionSystemPackageReadAdapter: GovernedClinicalDecisionSystemPackageReadAdapter = { get: getGovernedClinicalDecisionSystemPackage };
