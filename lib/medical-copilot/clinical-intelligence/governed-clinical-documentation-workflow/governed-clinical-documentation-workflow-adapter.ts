import { getMedicalCopilotGovernedClinicalDocumentationWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalDocumentationWorkflowEnvelope } from "./governed-clinical-documentation-workflow-mapper";
import type { GovernedClinicalDocumentationWorkflowResult } from "./governed-clinical-documentation-workflow";
export type GovernedClinicalDocumentationWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalDocumentationWorkflowResult | null> };
export async function getGovernedClinicalDocumentationWorkflow(sessionId: string): Promise<GovernedClinicalDocumentationWorkflowResult | null> { return mapGovernedClinicalDocumentationWorkflowEnvelope(await getMedicalCopilotGovernedClinicalDocumentationWorkflow(sessionId)); }
export const clinicalDocumentationWorkflowReadAdapter: GovernedClinicalDocumentationWorkflowReadAdapter = { get: getGovernedClinicalDocumentationWorkflow };
