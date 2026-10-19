import { getMedicalCopilotClinicalReasoningPackage } from "../../api";
import { mapClinicalReasoningPackageEnvelope } from "./clinical-reasoning-package-mapper";
import type { ClinicalReasoningPackageBuilderResult } from "./clinical-reasoning-package";
export async function getClinicalReasoningPackage(sessionId: string): Promise<ClinicalReasoningPackageBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningPackage(sessionId);
  return mapClinicalReasoningPackageEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningPackageReadAdapter = { getClinicalReasoningPackage: typeof getClinicalReasoningPackage };
export const clinicalReasoningPackageOutputReadAdapter: ClinicalReasoningPackageReadAdapter = { getClinicalReasoningPackage };
