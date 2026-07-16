import { getMedicalCopilotGovernedClinicalLongitudinalIntelligencePackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalLongitudinalIntelligencePackageEnvelope } from "./governed-clinical-longitudinal-intelligence-package-mapper";
import type { GovernedClinicalLongitudinalIntelligencePackageResult } from "./governed-clinical-longitudinal-intelligence-package";
export type GovernedClinicalLongitudinalIntelligencePackageReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalLongitudinalIntelligencePackageResult | null> };
export async function getGovernedClinicalLongitudinalIntelligencePackage(sessionId: string): Promise<GovernedClinicalLongitudinalIntelligencePackageResult | null> { return mapGovernedClinicalLongitudinalIntelligencePackageEnvelope(await getMedicalCopilotGovernedClinicalLongitudinalIntelligencePackage(sessionId)); }
export const governedClinicalLongitudinalIntelligencePackageReadAdapter: GovernedClinicalLongitudinalIntelligencePackageReadAdapter = { get: getGovernedClinicalLongitudinalIntelligencePackage };
