import { getMedicalCopilotGovernedSpecializedClinicalIntelligencePackage } from "../../api";
import { mapGovernedSpecializedClinicalIntelligencePackageEnvelope } from "./governed-specialized-clinical-intelligence-package-mapper";
import type { GovernedSpecializedClinicalIntelligencePackageResult } from "./governed-specialized-clinical-intelligence-package";
export async function getGovernedSpecializedClinicalIntelligencePackage(sessionId: string): Promise<GovernedSpecializedClinicalIntelligencePackageResult | null> {
  const envelope = await getMedicalCopilotGovernedSpecializedClinicalIntelligencePackage(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedSpecializedClinicalIntelligencePackageEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedSpecializedClinicalIntelligencePackageReadAdapter = { getGovernedSpecializedClinicalIntelligencePackage: typeof getGovernedSpecializedClinicalIntelligencePackage };
export const governedSpecializedClinicalIntelligencePackageReadAdapter: GovernedSpecializedClinicalIntelligencePackageReadAdapter = { getGovernedSpecializedClinicalIntelligencePackage };
