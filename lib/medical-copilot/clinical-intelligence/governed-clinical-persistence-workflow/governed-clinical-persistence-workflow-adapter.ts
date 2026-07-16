import { getMedicalCopilotGovernedClinicalPersistenceWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalPersistenceWorkflowEnvelope } from "./governed-clinical-persistence-workflow-mapper";
import type { GovernedClinicalPersistenceWorkflowResult } from "./governed-clinical-persistence-workflow";
export type GovernedClinicalPersistenceWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalPersistenceWorkflowResult | null> };
export async function getGovernedClinicalPersistenceWorkflow(sessionId: string): Promise<GovernedClinicalPersistenceWorkflowResult | null> { return mapGovernedClinicalPersistenceWorkflowEnvelope(await getMedicalCopilotGovernedClinicalPersistenceWorkflow(sessionId)); }
export const clinicalPersistenceWorkflowReadAdapter: GovernedClinicalPersistenceWorkflowReadAdapter = { get: getGovernedClinicalPersistenceWorkflow };
