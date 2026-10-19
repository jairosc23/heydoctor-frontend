import { getMedicalCopilotGovernedClinicalGuidelinesEnginePackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalGuidelinesEnginePackageEnvelope } from "./governed-clinical-guidelines-engine-package-mapper";
import type { GovernedClinicalGuidelinesEnginePackageResult } from "./governed-clinical-guidelines-engine-package";

export type GovernedClinicalGuidelinesEnginePackageReadAdapter = {
  get: (sessionId: string) => Promise<GovernedClinicalGuidelinesEnginePackageResult | null>;
};

export async function getGovernedClinicalGuidelinesEnginePackage(sessionId: string): Promise<GovernedClinicalGuidelinesEnginePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalGuidelinesEnginePackage(sessionId);
  return mapGovernedClinicalGuidelinesEnginePackageEnvelope(envelope);
}

export const governedClinicalGuidelinesEnginePackageReadAdapter: GovernedClinicalGuidelinesEnginePackageReadAdapter = { get: getGovernedClinicalGuidelinesEnginePackage };
