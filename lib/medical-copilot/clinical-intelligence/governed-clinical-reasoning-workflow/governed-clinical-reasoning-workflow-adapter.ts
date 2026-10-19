import { getMedicalCopilotGovernedClinicalReasoningWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalReasoningWorkflowEnvelope } from "./governed-clinical-reasoning-workflow-mapper";
import type { GovernedClinicalReasoningWorkflowResult } from "./governed-clinical-reasoning-workflow";
export type GovernedClinicalReasoningWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalReasoningWorkflowResult | null> };
export async function getGovernedClinicalReasoningWorkflow(sessionId: string): Promise<GovernedClinicalReasoningWorkflowResult | null> { return mapGovernedClinicalReasoningWorkflowEnvelope(await getMedicalCopilotGovernedClinicalReasoningWorkflow(sessionId)); }
export const clinicalReasoningWorkflowReadAdapter: GovernedClinicalReasoningWorkflowReadAdapter = { get: getGovernedClinicalReasoningWorkflow };
