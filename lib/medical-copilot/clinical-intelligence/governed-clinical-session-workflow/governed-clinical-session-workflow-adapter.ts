import { getMedicalCopilotGovernedClinicalSessionWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalSessionWorkflowEnvelope } from "./governed-clinical-session-workflow-mapper";
import type { GovernedClinicalSessionWorkflowResult } from "./governed-clinical-session-workflow";
export type GovernedClinicalSessionWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalSessionWorkflowResult | null> };
export async function getGovernedClinicalSessionWorkflow(sessionId: string): Promise<GovernedClinicalSessionWorkflowResult | null> { return mapGovernedClinicalSessionWorkflowEnvelope(await getMedicalCopilotGovernedClinicalSessionWorkflow(sessionId)); }
export const clinicalSessionWorkflowReadAdapter: GovernedClinicalSessionWorkflowReadAdapter = { get: getGovernedClinicalSessionWorkflow };
