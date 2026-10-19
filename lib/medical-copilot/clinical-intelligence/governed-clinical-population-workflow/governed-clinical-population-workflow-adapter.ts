import { getMedicalCopilotGovernedClinicalPopulationWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalPopulationWorkflowEnvelope } from "./governed-clinical-population-workflow-mapper";
import type { GovernedClinicalPopulationWorkflowResult } from "./governed-clinical-population-workflow";
export type GovernedClinicalPopulationWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalPopulationWorkflowResult | null> };
export async function getGovernedClinicalPopulationWorkflow(sessionId: string): Promise<GovernedClinicalPopulationWorkflowResult | null> { return mapGovernedClinicalPopulationWorkflowEnvelope(await getMedicalCopilotGovernedClinicalPopulationWorkflow(sessionId)); }
export const clinicalPopulationWorkflowReadAdapter: GovernedClinicalPopulationWorkflowReadAdapter = { get: getGovernedClinicalPopulationWorkflow };
