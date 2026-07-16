import { getMedicalCopilotGovernedClinicalIntelligenceWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalIntelligenceWorkflowEnvelope } from "./governed-clinical-intelligence-workflow-mapper";
import type { GovernedClinicalIntelligenceWorkflowResult } from "./governed-clinical-intelligence-workflow";
export type GovernedClinicalIntelligenceWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalIntelligenceWorkflowResult | null> };
export async function getGovernedClinicalIntelligenceWorkflow(sessionId: string): Promise<GovernedClinicalIntelligenceWorkflowResult | null> { return mapGovernedClinicalIntelligenceWorkflowEnvelope(await getMedicalCopilotGovernedClinicalIntelligenceWorkflow(sessionId)); }
export const clinicalIntelligenceWorkflowReadAdapter: GovernedClinicalIntelligenceWorkflowReadAdapter = { get: getGovernedClinicalIntelligenceWorkflow };
