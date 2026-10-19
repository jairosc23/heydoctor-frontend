import { getMedicalCopilotGovernedClinicalCalculationSystemPackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalCalculationSystemPackageEnvelope } from "./governed-clinical-calculation-system-package-mapper";
import type { GovernedClinicalCalculationSystemPackageResult } from "./governed-clinical-calculation-system-package";
export type GovernedClinicalCalculationSystemPackageReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalCalculationSystemPackageResult | null> };
export async function getGovernedClinicalCalculationSystemPackage(sessionId: string): Promise<GovernedClinicalCalculationSystemPackageResult | null> {
  return mapGovernedClinicalCalculationSystemPackageEnvelope(await getMedicalCopilotGovernedClinicalCalculationSystemPackage(sessionId));
}
export const governedClinicalCalculationSystemPackageReadAdapter: GovernedClinicalCalculationSystemPackageReadAdapter = { get: getGovernedClinicalCalculationSystemPackage };
