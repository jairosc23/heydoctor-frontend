import { getMedicalCopilotGovernedClinicalCalculationWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalCalculationWorkflowEnvelope } from "./governed-clinical-calculation-workflow-mapper";
import type { GovernedClinicalCalculationWorkflowResult } from "./governed-clinical-calculation-workflow";
export type GovernedClinicalCalculationWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalCalculationWorkflowResult | null> };
export async function getGovernedClinicalCalculationWorkflow(sessionId: string): Promise<GovernedClinicalCalculationWorkflowResult | null> { return mapGovernedClinicalCalculationWorkflowEnvelope(await getMedicalCopilotGovernedClinicalCalculationWorkflow(sessionId)); }
export const clinicalCalculationWorkflowReadAdapter: GovernedClinicalCalculationWorkflowReadAdapter = { get: getGovernedClinicalCalculationWorkflow };
