import { getMedicalCopilotGovernedClinicalPhysicianReviewWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalPhysicianReviewWorkflowEnvelope } from "./governed-clinical-physician-review-workflow-mapper";
import type { GovernedClinicalPhysicianReviewWorkflowResult } from "./governed-clinical-physician-review-workflow";
export type GovernedClinicalPhysicianReviewWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalPhysicianReviewWorkflowResult | null> };
export async function getGovernedClinicalPhysicianReviewWorkflow(sessionId: string): Promise<GovernedClinicalPhysicianReviewWorkflowResult | null> { return mapGovernedClinicalPhysicianReviewWorkflowEnvelope(await getMedicalCopilotGovernedClinicalPhysicianReviewWorkflow(sessionId)); }
export const clinicalPhysicianReviewWorkflowReadAdapter: GovernedClinicalPhysicianReviewWorkflowReadAdapter = { get: getGovernedClinicalPhysicianReviewWorkflow };
