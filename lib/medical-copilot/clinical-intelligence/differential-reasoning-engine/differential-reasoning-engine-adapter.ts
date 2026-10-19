import { getMedicalCopilotDifferentialReasoningEngine } from "../../api";
import { mapDifferentialReasoningEngineEnvelope } from "./differential-reasoning-engine-mapper";
import type { DifferentialReasoningEngineBuilderResult } from "./differential-reasoning-engine";
export async function getDifferentialReasoningEngine(sessionId: string): Promise<DifferentialReasoningEngineBuilderResult | null> {
  const envelope = await getMedicalCopilotDifferentialReasoningEngine(sessionId);
  return mapDifferentialReasoningEngineEnvelope(envelope.data ?? envelope);
}
export type DifferentialReasoningEngineReadAdapter = { getDifferentialReasoningEngine: typeof getDifferentialReasoningEngine };
export const differentialReasoningEngineReadAdapter: DifferentialReasoningEngineReadAdapter = { getDifferentialReasoningEngine };
