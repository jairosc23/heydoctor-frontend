import { getMedicalCopilotGovernedClinicalKnowledgeWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalKnowledgeWorkflowEnvelope } from "./governed-clinical-knowledge-workflow-mapper";
import type { GovernedClinicalKnowledgeWorkflowResult } from "./governed-clinical-knowledge-workflow";
export type GovernedClinicalKnowledgeWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalKnowledgeWorkflowResult | null> };
export async function getGovernedClinicalKnowledgeWorkflow(sessionId: string): Promise<GovernedClinicalKnowledgeWorkflowResult | null> { return mapGovernedClinicalKnowledgeWorkflowEnvelope(await getMedicalCopilotGovernedClinicalKnowledgeWorkflow(sessionId)); }
export const clinicalKnowledgeWorkflowReadAdapter: GovernedClinicalKnowledgeWorkflowReadAdapter = { get: getGovernedClinicalKnowledgeWorkflow };
