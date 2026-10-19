/**
 * AI-4 — Read adapter for OpenAI provider diagnostic (Facade only).
 */

import { getMedicalCopilotOpenAIProvider } from "../api";
import { mapOpenAIProviderEnvelope } from "./openai-provider-mapper";
import type { GovernedAIGatewayResult } from "./governed-ai-gateway";

export async function getOpenAIProviderDiagnostic(
  sessionId: string,
): Promise<GovernedAIGatewayResult | null> {
  const envelope = await getMedicalCopilotOpenAIProvider(sessionId);
  return mapOpenAIProviderEnvelope(envelope.data ?? envelope);
}

export type OpenAIProviderReadAdapter = {
  getOpenAIProviderDiagnostic: typeof getOpenAIProviderDiagnostic;
};

export const openAIProviderReadAdapter: OpenAIProviderReadAdapter = {
  getOpenAIProviderDiagnostic,
};
