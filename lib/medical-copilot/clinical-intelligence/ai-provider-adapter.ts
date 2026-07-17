/**
 * AI-2 — Read adapter for AI Provider Route (Facade only).
 */

import { getMedicalCopilotAIProviderRoute } from "../api";
import { mapAIProviderRouteEnvelope } from "./ai-provider-mapper";
import type { AIProviderRouteResult } from "./ai-provider";

export async function getAIProviderRoute(
  sessionId: string,
): Promise<AIProviderRouteResult | null> {
  const envelope = await getMedicalCopilotAIProviderRoute(sessionId);
  return mapAIProviderRouteEnvelope(envelope.data ?? envelope);
}

export type AIProviderRouteReadAdapter = {
  getAIProviderRoute: typeof getAIProviderRoute;
};

export const aiProviderRouteReadAdapter: AIProviderRouteReadAdapter = {
  getAIProviderRoute,
};
