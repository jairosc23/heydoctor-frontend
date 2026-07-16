import { getMedicalCopilotClinicalReasoningOrchestrator } from "../../api";
import { mapClinicalReasoningOrchestratorEnvelope } from "./clinical-reasoning-orchestrator-mapper";
import type { ClinicalReasoningOrchestratorBuilderResult } from "./clinical-reasoning-orchestrator";
export async function getClinicalReasoningOrchestrator(sessionId: string): Promise<ClinicalReasoningOrchestratorBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningOrchestrator(sessionId);
  return mapClinicalReasoningOrchestratorEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningOrchestratorReadAdapter = { getClinicalReasoningOrchestrator: typeof getClinicalReasoningOrchestrator };
export const clinicalReasoningOrchestratorReadAdapter: ClinicalReasoningOrchestratorReadAdapter = { getClinicalReasoningOrchestrator };
