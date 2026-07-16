import { getMedicalCopilotGovernedClinicalAnalyticsWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalAnalyticsWorkflowEnvelope } from "./governed-clinical-analytics-workflow-mapper";
import type { GovernedClinicalAnalyticsWorkflowResult } from "./governed-clinical-analytics-workflow";
export type GovernedClinicalAnalyticsWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalAnalyticsWorkflowResult | null> };
export async function getGovernedClinicalAnalyticsWorkflow(sessionId: string): Promise<GovernedClinicalAnalyticsWorkflowResult | null> { return mapGovernedClinicalAnalyticsWorkflowEnvelope(await getMedicalCopilotGovernedClinicalAnalyticsWorkflow(sessionId)); }
export const clinicalAnalyticsWorkflowReadAdapter: GovernedClinicalAnalyticsWorkflowReadAdapter = { get: getGovernedClinicalAnalyticsWorkflow };
