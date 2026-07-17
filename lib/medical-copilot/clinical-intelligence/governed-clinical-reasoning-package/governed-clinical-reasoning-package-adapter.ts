import { getMedicalCopilotGovernedClinicalReasoningPackage } from "../../api";
import { mapGovernedClinicalReasoningPackageEnvelope } from "./governed-clinical-reasoning-package-mapper";
import type { GovernedClinicalReasoningPackageBuilderResult } from "./governed-clinical-reasoning-package";

export async function getGovernedClinicalReasoningPackage(sessionId: string): Promise<GovernedClinicalReasoningPackageBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalReasoningPackage(sessionId);
  return mapGovernedClinicalReasoningPackageEnvelope(envelope.data ?? envelope);
}

export type GovernedClinicalReasoningPackageReadAdapter = { getGovernedClinicalReasoningPackage: typeof getGovernedClinicalReasoningPackage };
export const clinicalReasoningPackageReadAdapter: GovernedClinicalReasoningPackageReadAdapter = { getGovernedClinicalReasoningPackage };
