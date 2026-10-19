import { getMedicalCopilotGovernedClinicalFunctionalIntelligencePackage } from "../../api";
import { mapGovernedClinicalFunctionalIntelligencePackageEnvelope } from "./governed-clinical-functional-intelligence-package-mapper";
import type { GovernedClinicalFunctionalIntelligencePackageResult } from "./governed-clinical-functional-intelligence-package";
export async function getGovernedClinicalFunctionalIntelligencePackage(sessionId: string): Promise<GovernedClinicalFunctionalIntelligencePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalFunctionalIntelligencePackage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalFunctionalIntelligencePackageEnvelope({ ...data, reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null });
}
export type GovernedClinicalFunctionalIntelligencePackageReadAdapter = { getGovernedClinicalFunctionalIntelligencePackage: typeof getGovernedClinicalFunctionalIntelligencePackage };
export const governedClinicalFunctionalIntelligencePackageReadAdapter: GovernedClinicalFunctionalIntelligencePackageReadAdapter = { getGovernedClinicalFunctionalIntelligencePackage };
