import { getMedicalCopilotGovernedClinicalAuditWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalAuditWorkflowEnvelope } from "./governed-clinical-audit-workflow-mapper";
import type { GovernedClinicalAuditWorkflowResult } from "./governed-clinical-audit-workflow";
export type GovernedClinicalAuditWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalAuditWorkflowResult | null> };
export async function getGovernedClinicalAuditWorkflow(sessionId: string): Promise<GovernedClinicalAuditWorkflowResult | null> { return mapGovernedClinicalAuditWorkflowEnvelope(await getMedicalCopilotGovernedClinicalAuditWorkflow(sessionId)); }
export const clinicalAuditWorkflowReadAdapter: GovernedClinicalAuditWorkflowReadAdapter = { get: getGovernedClinicalAuditWorkflow };
