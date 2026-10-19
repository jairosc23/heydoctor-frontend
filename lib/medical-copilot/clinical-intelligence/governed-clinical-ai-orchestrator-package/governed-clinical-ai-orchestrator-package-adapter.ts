import { getMedicalCopilotGovernedClinicalAiOrchestratorPackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalAiOrchestratorPackageEnvelope } from "./governed-clinical-ai-orchestrator-package-mapper";
import type { GovernedClinicalAiOrchestratorPackageResult } from "./governed-clinical-ai-orchestrator-package";
export type GovernedClinicalAiOrchestratorPackageReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalAiOrchestratorPackageResult | null> };
export async function getGovernedClinicalAiOrchestratorPackage(sessionId: string): Promise<GovernedClinicalAiOrchestratorPackageResult | null> { return mapGovernedClinicalAiOrchestratorPackageEnvelope(await getMedicalCopilotGovernedClinicalAiOrchestratorPackage(sessionId)); }
export const governedClinicalAiOrchestratorPackageReadAdapter: GovernedClinicalAiOrchestratorPackageReadAdapter = { get: getGovernedClinicalAiOrchestratorPackage };
