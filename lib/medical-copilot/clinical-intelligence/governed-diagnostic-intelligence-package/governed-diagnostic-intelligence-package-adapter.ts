import { getMedicalCopilotGovernedDiagnosticIntelligencePackage } from "@/lib/medical-copilot/api";
import { mapGovernedDiagnosticIntelligencePackageEnvelope } from "./governed-diagnostic-intelligence-package-mapper";
import type { GovernedDiagnosticIntelligencePackageResult } from "./governed-diagnostic-intelligence-package";
export type GovernedDiagnosticIntelligencePackageReadAdapter = { get: (sessionId: string) => Promise<GovernedDiagnosticIntelligencePackageResult | null> };
export async function getGovernedDiagnosticIntelligencePackage(sessionId: string): Promise<GovernedDiagnosticIntelligencePackageResult | null> { return mapGovernedDiagnosticIntelligencePackageEnvelope(await getMedicalCopilotGovernedDiagnosticIntelligencePackage(sessionId)); }
export const governedDiagnosticIntelligencePackageReadAdapter: GovernedDiagnosticIntelligencePackageReadAdapter = { get: getGovernedDiagnosticIntelligencePackage };
