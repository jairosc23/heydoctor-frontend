import { getMedicalCopilotEvidenceReasoningEngine } from "../../api";
import { mapEvidenceReasoningEngineEnvelope } from "./evidence-reasoning-engine-mapper";
import type { EvidenceReasoningEngineBuilderResult } from "./evidence-reasoning-engine";
export async function getEvidenceReasoningEngine(sessionId: string): Promise<EvidenceReasoningEngineBuilderResult | null> {
  const envelope = await getMedicalCopilotEvidenceReasoningEngine(sessionId);
  return mapEvidenceReasoningEngineEnvelope(envelope.data ?? envelope);
}
export type EvidenceReasoningEngineReadAdapter = { getEvidenceReasoningEngine: typeof getEvidenceReasoningEngine };
export const evidenceReasoningEngineReadAdapter: EvidenceReasoningEngineReadAdapter = { getEvidenceReasoningEngine };
