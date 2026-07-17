import { runMedicalCopilotGovernedClinicalIntelligenceFlow } from "../../api";
import { mapGovernedClinicalIntelligenceFlowEnvelope } from "./governed-clinical-intelligence-flow-mapper";
import type { GovernedClinicalIntelligenceFlowResult } from "./governed-clinical-intelligence-flow";

export async function runGovernedClinicalIntelligenceFlow(
  sessionId: string,
): Promise<GovernedClinicalIntelligenceFlowResult | null> {
  const envelope = await runMedicalCopilotGovernedClinicalIntelligenceFlow(sessionId);
  return mapGovernedClinicalIntelligenceFlowEnvelope(envelope.data ?? envelope);
}

export type GovernedClinicalIntelligenceFlowRunAdapter = {
  runGovernedClinicalIntelligenceFlow: typeof runGovernedClinicalIntelligenceFlow;
};

export const governedClinicalIntelligenceFlowRunAdapter: GovernedClinicalIntelligenceFlowRunAdapter =
  { runGovernedClinicalIntelligenceFlow };
