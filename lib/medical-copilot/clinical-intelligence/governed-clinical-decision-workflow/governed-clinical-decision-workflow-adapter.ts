import { getMedicalCopilotGovernedClinicalDecisionWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalDecisionWorkflowEnvelope } from "./governed-clinical-decision-workflow-mapper";
import type { GovernedClinicalDecisionWorkflowResult } from "./governed-clinical-decision-workflow";
export type GovernedClinicalDecisionWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalDecisionWorkflowResult | null> };
export async function getGovernedClinicalDecisionWorkflow(sessionId: string): Promise<GovernedClinicalDecisionWorkflowResult | null> { return mapGovernedClinicalDecisionWorkflowEnvelope(await getMedicalCopilotGovernedClinicalDecisionWorkflow(sessionId)); }
export const clinicalDecisionWorkflowReadAdapter: GovernedClinicalDecisionWorkflowReadAdapter = { get: getGovernedClinicalDecisionWorkflow };
