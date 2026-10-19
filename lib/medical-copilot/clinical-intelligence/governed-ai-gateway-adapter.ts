/**
 * AI-3 — Read adapter for Governed AI Gateway (Facade only).
 */

import { getMedicalCopilotGovernedAIGateway } from "../api";
import { mapGovernedAIGatewayEnvelope } from "./governed-ai-gateway-mapper";
import type { GovernedAIGatewayResult } from "./governed-ai-gateway";

export async function getGovernedAIGateway(
  sessionId: string,
): Promise<GovernedAIGatewayResult | null> {
  const envelope = await getMedicalCopilotGovernedAIGateway(sessionId);
  return mapGovernedAIGatewayEnvelope(envelope.data ?? envelope);
}

export type GovernedAIGatewayReadAdapter = {
  getGovernedAIGateway: typeof getGovernedAIGateway;
};

export const governedAIGatewayReadAdapter: GovernedAIGatewayReadAdapter = {
  getGovernedAIGateway,
};
