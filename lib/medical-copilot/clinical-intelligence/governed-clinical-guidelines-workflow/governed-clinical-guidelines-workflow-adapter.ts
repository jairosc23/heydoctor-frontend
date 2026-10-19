import { getMedicalCopilotGovernedClinicalGuidelinesWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalGuidelinesWorkflowEnvelope } from "./governed-clinical-guidelines-workflow-mapper";
import type { GovernedClinicalGuidelinesWorkflowResult } from "./governed-clinical-guidelines-workflow";
export type GovernedClinicalGuidelinesWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalGuidelinesWorkflowResult | null> };
export async function getGovernedClinicalGuidelinesWorkflow(sessionId: string): Promise<GovernedClinicalGuidelinesWorkflowResult | null> { return mapGovernedClinicalGuidelinesWorkflowEnvelope(await getMedicalCopilotGovernedClinicalGuidelinesWorkflow(sessionId)); }
export const clinicalGuidelinesWorkflowReadAdapter: GovernedClinicalGuidelinesWorkflowReadAdapter = { get: getGovernedClinicalGuidelinesWorkflow };
