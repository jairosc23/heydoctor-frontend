import { getMedicalCopilotGovernedClinicalConsultationWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalConsultationWorkflowEnvelope } from "./governed-clinical-consultation-workflow-mapper";
import type { GovernedClinicalConsultationWorkflowResult } from "./governed-clinical-consultation-workflow";
export type GovernedClinicalConsultationWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalConsultationWorkflowResult | null> };
export async function getGovernedClinicalConsultationWorkflow(sessionId: string): Promise<GovernedClinicalConsultationWorkflowResult | null> { return mapGovernedClinicalConsultationWorkflowEnvelope(await getMedicalCopilotGovernedClinicalConsultationWorkflow(sessionId)); }
export const clinicalConsultationWorkflowReadAdapter: GovernedClinicalConsultationWorkflowReadAdapter = { get: getGovernedClinicalConsultationWorkflow };
