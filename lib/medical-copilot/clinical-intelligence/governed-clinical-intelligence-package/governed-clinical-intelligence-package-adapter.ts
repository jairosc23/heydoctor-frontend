import { getMedicalCopilotGovernedClinicalIntelligencePackage } from "../../api";
import { mapGovernedClinicalIntelligencePackageEnvelope } from "./governed-clinical-intelligence-package-mapper";
import type { GovernedClinicalIntelligencePackageBuilderResult } from "./governed-clinical-intelligence-package";

export async function getGovernedClinicalIntelligencePackage(sessionId: string): Promise<GovernedClinicalIntelligencePackageBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalIntelligencePackage(sessionId);
  return mapGovernedClinicalIntelligencePackageEnvelope(envelope.data ?? envelope);
}

export type GovernedClinicalIntelligencePackageReadAdapter = { getGovernedClinicalIntelligencePackage: typeof getGovernedClinicalIntelligencePackage };
export const governedClinicalIntelligencePackageReadAdapter: GovernedClinicalIntelligencePackageReadAdapter = { getGovernedClinicalIntelligencePackage };
