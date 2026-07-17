/**
 * AI-1 — Read adapter for Governed AI Request (Facade only).
 */

import { getMedicalCopilotGovernedAIRequest } from "../api";
import { mapGovernedAIRequestEnvelope } from "./governed-ai-request-mapper";
import type { GovernedAIRequestResult } from "./governed-ai-request";

export async function getGovernedAIRequest(
  sessionId: string,
): Promise<GovernedAIRequestResult | null> {
  const envelope = await getMedicalCopilotGovernedAIRequest(sessionId);
  return mapGovernedAIRequestEnvelope(envelope.data ?? envelope);
}

export type GovernedAIRequestReadAdapter = {
  getGovernedAIRequest: typeof getGovernedAIRequest;
};

export const governedAIRequestReadAdapter: GovernedAIRequestReadAdapter = {
  getGovernedAIRequest,
};
