import { getMedicalCopilotGovernedClinicalReasoningInputPackage } from "../../api";
import { mapGovernedClinicalReasoningInputPackageEnvelope } from "./governed-clinical-reasoning-input-package-mapper";
import type { GovernedClinicalReasoningInputPackageBuilderResult } from "./governed-clinical-reasoning-input-package";
export async function getGovernedClinicalReasoningInputPackage(sessionId: string): Promise<GovernedClinicalReasoningInputPackageBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalReasoningInputPackage(sessionId);
  return mapGovernedClinicalReasoningInputPackageEnvelope(envelope.data ?? envelope);
}
export type GovernedClinicalReasoningInputPackageReadAdapter = { getGovernedClinicalReasoningInputPackage: typeof getGovernedClinicalReasoningInputPackage };
export const clinicalReasoningInputPackageReadAdapter: GovernedClinicalReasoningInputPackageReadAdapter = { getGovernedClinicalReasoningInputPackage };
