import { getMedicalCopilotGovernedClinicalSafetyWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalSafetyWorkflowEnvelope } from "./governed-clinical-safety-workflow-mapper";
import type { GovernedClinicalSafetyWorkflowResult } from "./governed-clinical-safety-workflow";
export type GovernedClinicalSafetyWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalSafetyWorkflowResult | null> };
export async function getGovernedClinicalSafetyWorkflow(sessionId: string): Promise<GovernedClinicalSafetyWorkflowResult | null> { return mapGovernedClinicalSafetyWorkflowEnvelope(await getMedicalCopilotGovernedClinicalSafetyWorkflow(sessionId)); }
export const clinicalSafetyWorkflowReadAdapter: GovernedClinicalSafetyWorkflowReadAdapter = { get: getGovernedClinicalSafetyWorkflow };
