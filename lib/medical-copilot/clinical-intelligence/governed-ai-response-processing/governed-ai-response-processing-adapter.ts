import { getMedicalCopilotGovernedAIResponseProcessing } from "../../api";
import { mapGovernedProcessedAIResponseEnvelope } from "./governed-ai-response-processing-mapper";
import type { GovernedProcessedAIResponseBuilderResult } from "./governed-ai-response-processing";

export async function getGovernedAIResponseProcessing(sessionId: string): Promise<GovernedProcessedAIResponseBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedAIResponseProcessing(sessionId);
  return mapGovernedProcessedAIResponseEnvelope(envelope.data ?? envelope);
}

export type GovernedProcessedAIResponseReadAdapter = { getGovernedAIResponseProcessing: typeof getGovernedAIResponseProcessing };
export const processedReadAdapter: GovernedProcessedAIResponseReadAdapter = { getGovernedAIResponseProcessing };
