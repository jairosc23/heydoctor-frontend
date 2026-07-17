import { getMedicalCopilotGovernedClinicalMarketplaceWorkflow } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalMarketplaceWorkflowEnvelope } from "./governed-clinical-marketplace-workflow-mapper";
import type { GovernedClinicalMarketplaceWorkflowResult } from "./governed-clinical-marketplace-workflow";
export type GovernedClinicalMarketplaceWorkflowReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalMarketplaceWorkflowResult | null> };
export async function getGovernedClinicalMarketplaceWorkflow(sessionId: string): Promise<GovernedClinicalMarketplaceWorkflowResult | null> { return mapGovernedClinicalMarketplaceWorkflowEnvelope(await getMedicalCopilotGovernedClinicalMarketplaceWorkflow(sessionId)); }
export const clinicalMarketplaceWorkflowReadAdapter: GovernedClinicalMarketplaceWorkflowReadAdapter = { get: getGovernedClinicalMarketplaceWorkflow };
