import { getMedicalCopilotGovernedProviderPayloadTranslation } from "../../api";
import { mapGovernedTranslatedProviderPayloadEnvelope } from "./governed-provider-payload-translation-mapper";
import type { GovernedTranslatedProviderPayloadBuilderResult } from "./governed-provider-payload-translation";

export async function getGovernedProviderPayloadTranslation(sessionId: string): Promise<GovernedTranslatedProviderPayloadBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedProviderPayloadTranslation(sessionId);
  return mapGovernedTranslatedProviderPayloadEnvelope(envelope.data ?? envelope);
}

export type GovernedTranslatedProviderPayloadReadAdapter = { getGovernedProviderPayloadTranslation: typeof getGovernedProviderPayloadTranslation };
export const translationReadAdapter: GovernedTranslatedProviderPayloadReadAdapter = { getGovernedProviderPayloadTranslation };
