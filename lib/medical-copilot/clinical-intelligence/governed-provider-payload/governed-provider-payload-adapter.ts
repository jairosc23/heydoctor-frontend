/**
 * AI-10 — Read adapter for GovernedProviderPayload (Facade only).
 */

import { getMedicalCopilotGovernedProviderPayload } from "../../api";
import { mapGovernedProviderPayloadEnvelope } from "./governed-provider-payload-mapper";
import type { GovernedProviderPayloadBuilderResult } from "./governed-provider-payload";

export async function getGovernedProviderPayload(
  sessionId: string,
): Promise<GovernedProviderPayloadBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedProviderPayload(sessionId);
  return mapGovernedProviderPayloadEnvelope(envelope.data ?? envelope);
}

export type GovernedProviderPayloadReadAdapter = {
  getGovernedProviderPayload: typeof getGovernedProviderPayload;
};

export const payloadReadAdapter: GovernedProviderPayloadReadAdapter = {
  getGovernedProviderPayload,
};
