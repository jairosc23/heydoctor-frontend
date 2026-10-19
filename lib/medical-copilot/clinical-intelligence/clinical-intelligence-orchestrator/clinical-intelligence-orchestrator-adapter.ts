import { getMedicalCopilotClinicalIntelligenceOrchestrator } from "../../api";
import { mapClinicalIntelligenceOrchestratorEnvelope } from "./clinical-intelligence-orchestrator-mapper";
import type { ClinicalIntelligenceOrchestratorBuilderResult } from "./clinical-intelligence-orchestrator";
export async function getClinicalIntelligenceOrchestrator(sessionId: string): Promise<ClinicalIntelligenceOrchestratorBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligenceOrchestrator(sessionId);
  return mapClinicalIntelligenceOrchestratorEnvelope(envelope.data ?? envelope);
}
export type ClinicalIntelligenceOrchestratorReadAdapter = { getClinicalIntelligenceOrchestrator: typeof getClinicalIntelligenceOrchestrator };
export const clinicalIntelligenceOrchestratorReadAdapter: ClinicalIntelligenceOrchestratorReadAdapter = { getClinicalIntelligenceOrchestrator };
