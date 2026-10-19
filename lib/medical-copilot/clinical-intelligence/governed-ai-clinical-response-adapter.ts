/**
 * AI-6 — Read adapter for Governed AI Clinical Response (Facade only).
 */

import { getMedicalCopilotGovernedAIClinicalResponse } from "../api";
import { mapGovernedAIClinicalResponseEnvelope } from "./governed-ai-clinical-response-mapper";
import type { GovernedAIClinicalResponseBuilderResult } from "./governed-ai-clinical-response";

export async function getGovernedAIClinicalResponse(
  sessionId: string,
): Promise<GovernedAIClinicalResponseBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedAIClinicalResponse(sessionId);
  return mapGovernedAIClinicalResponseEnvelope(envelope.data ?? envelope);
}

export type GovernedAIClinicalResponseReadAdapter = {
  getGovernedAIClinicalResponse: typeof getGovernedAIClinicalResponse;
};

export const governedAIClinicalResponseReadAdapter: GovernedAIClinicalResponseReadAdapter =
  {
    getGovernedAIClinicalResponse,
  };
