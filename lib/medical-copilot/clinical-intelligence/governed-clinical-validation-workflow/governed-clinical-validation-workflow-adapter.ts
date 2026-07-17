import { getMedicalCopilotGovernedClinicalValidationWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalValidationWorkflowEnvelope } from "./governed-clinical-validation-workflow-mapper";
import type { GovernedClinicalValidationWorkflowResult } from "./governed-clinical-validation-workflow";
export type GovernedClinicalValidationWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalValidationWorkflowResult | null> };
export async function getGovernedClinicalValidationWorkflow(sessionId: string): Promise<GovernedClinicalValidationWorkflowResult | null> { return mapGovernedClinicalValidationWorkflowEnvelope(await getMedicalCopilotGovernedClinicalValidationWorkflow(sessionId)); }
export const clinicalValidationWorkflowReadAdapter: GovernedClinicalValidationWorkflowReadAdapter = { get: getGovernedClinicalValidationWorkflow };
