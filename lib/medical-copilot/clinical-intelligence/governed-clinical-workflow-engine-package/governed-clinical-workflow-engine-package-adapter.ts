import { getMedicalCopilotGovernedClinicalWorkflowEnginePackage } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalWorkflowEnginePackageEnvelope } from "./governed-clinical-workflow-engine-package-mapper";
import type { GovernedClinicalWorkflowEnginePackageResult } from "./governed-clinical-workflow-engine-package";
export type GovernedClinicalWorkflowEnginePackageReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalWorkflowEnginePackageResult | null> };
export async function getGovernedClinicalWorkflowEnginePackage(sessionId: string): Promise<GovernedClinicalWorkflowEnginePackageResult | null> { return mapGovernedClinicalWorkflowEnginePackageEnvelope(await getMedicalCopilotGovernedClinicalWorkflowEnginePackage(sessionId)); }
export const clinicalWorkflowEnginePackageReadAdapter: GovernedClinicalWorkflowEnginePackageReadAdapter = { get: getGovernedClinicalWorkflowEnginePackage };
