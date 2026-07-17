import { getMedicalCopilotGovernedTherapeuticIntelligencePackage } from "@/lib/medical-copilot/api";
import { mapGovernedTherapeuticIntelligencePackageEnvelope } from "./governed-therapeutic-intelligence-package-mapper";
import type { GovernedTherapeuticIntelligencePackageResult } from "./governed-therapeutic-intelligence-package";
export type GovernedTherapeuticIntelligencePackageReadAdapter = { get: (sessionId: string) => Promise<GovernedTherapeuticIntelligencePackageResult | null> };
export async function getGovernedTherapeuticIntelligencePackage(sessionId: string): Promise<GovernedTherapeuticIntelligencePackageResult | null> { return mapGovernedTherapeuticIntelligencePackageEnvelope(await getMedicalCopilotGovernedTherapeuticIntelligencePackage(sessionId)); }
export const governedTherapeuticIntelligencePackageReadAdapter: GovernedTherapeuticIntelligencePackageReadAdapter = { get: getGovernedTherapeuticIntelligencePackage };
