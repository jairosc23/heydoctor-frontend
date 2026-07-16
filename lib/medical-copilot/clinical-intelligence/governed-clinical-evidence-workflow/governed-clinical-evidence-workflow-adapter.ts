import { getMedicalCopilotGovernedClinicalEvidenceWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalEvidenceWorkflowEnvelope } from "./governed-clinical-evidence-workflow-mapper";
import type { GovernedClinicalEvidenceWorkflowResult } from "./governed-clinical-evidence-workflow";
export type GovernedClinicalEvidenceWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalEvidenceWorkflowResult | null> };
export async function getGovernedClinicalEvidenceWorkflow(sessionId: string): Promise<GovernedClinicalEvidenceWorkflowResult | null> { return mapGovernedClinicalEvidenceWorkflowEnvelope(await getMedicalCopilotGovernedClinicalEvidenceWorkflow(sessionId)); }
export const clinicalEvidenceWorkflowReadAdapter: GovernedClinicalEvidenceWorkflowReadAdapter = { get: getGovernedClinicalEvidenceWorkflow };
