/**
 * AI-12 — Read adapter for GovernedNormalizedAIResponse (Facade only).
 */

import { getMedicalCopilotGovernedAIResponseNormalizer } from "../../api";
import { mapGovernedNormalizedAIResponseEnvelope } from "./governed-ai-response-normalizer-mapper";
import type { GovernedNormalizedAIResponseBuilderResult } from "./governed-ai-response-normalizer";

export async function getGovernedAIResponseNormalizer(
  sessionId: string,
): Promise<GovernedNormalizedAIResponseBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedAIResponseNormalizer(sessionId);
  return mapGovernedNormalizedAIResponseEnvelope(envelope.data ?? envelope);
}

export type GovernedNormalizedAIResponseReadAdapter = {
  getGovernedAIResponseNormalizer: typeof getGovernedAIResponseNormalizer;
};

export const normalizedReadAdapter: GovernedNormalizedAIResponseReadAdapter = {
  getGovernedAIResponseNormalizer,
};
