import { getMedicalCopilotGovernedClinicalDashboardWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalDashboardWorkflowEnvelope } from "./governed-clinical-dashboard-workflow-mapper";
import type { GovernedClinicalDashboardWorkflowResult } from "./governed-clinical-dashboard-workflow";
export type GovernedClinicalDashboardWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalDashboardWorkflowResult | null> };
export async function getGovernedClinicalDashboardWorkflow(sessionId: string): Promise<GovernedClinicalDashboardWorkflowResult | null> { return mapGovernedClinicalDashboardWorkflowEnvelope(await getMedicalCopilotGovernedClinicalDashboardWorkflow(sessionId)); }
export const clinicalDashboardWorkflowReadAdapter: GovernedClinicalDashboardWorkflowReadAdapter = { get: getGovernedClinicalDashboardWorkflow };
