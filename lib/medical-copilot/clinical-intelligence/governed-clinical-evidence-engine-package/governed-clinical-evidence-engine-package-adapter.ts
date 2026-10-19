import { getMedicalCopilotGovernedClinicalEvidenceEnginePackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalEvidenceEnginePackageEnvelope } from "./governed-clinical-evidence-engine-package-mapper";
import type { GovernedClinicalEvidenceEnginePackageResult } from "./governed-clinical-evidence-engine-package";

export type GovernedClinicalEvidenceEnginePackageReadAdapter = {
  get: (sessionId: string) => Promise<GovernedClinicalEvidenceEnginePackageResult | null>;
};

export async function getGovernedClinicalEvidenceEnginePackage(sessionId: string): Promise<GovernedClinicalEvidenceEnginePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalEvidenceEnginePackage(sessionId);
  return mapGovernedClinicalEvidenceEnginePackageEnvelope(envelope);
}

export const governedClinicalEvidenceEnginePackageReadAdapter: GovernedClinicalEvidenceEnginePackageReadAdapter = {
  get: getGovernedClinicalEvidenceEnginePackage,
};
