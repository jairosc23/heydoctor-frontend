import { getMedicalCopilotGovernedClinicalSessionPackage } from "../../api";
import { mapGovernedClinicalSessionPackageEnvelope } from "./governed-clinical-session-package-mapper";
import type { GovernedClinicalSessionPackageBuilderResult } from "./governed-clinical-session-package";

export async function getGovernedClinicalSessionPackage(sessionId: string): Promise<GovernedClinicalSessionPackageBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalSessionPackage(sessionId);
  return mapGovernedClinicalSessionPackageEnvelope(envelope.data ?? envelope);
}

export type GovernedClinicalSessionPackageReadAdapter = { getGovernedClinicalSessionPackage: typeof getGovernedClinicalSessionPackage };
export const sessionPackageReadAdapter: GovernedClinicalSessionPackageReadAdapter = { getGovernedClinicalSessionPackage };
