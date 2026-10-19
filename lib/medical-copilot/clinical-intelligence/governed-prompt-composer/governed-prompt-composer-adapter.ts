/**
 * AI-9 — Read adapter for GovernedPrompt (Facade only).
 */

import { getMedicalCopilotGovernedPromptComposer } from "../../api";
import { mapGovernedPromptEnvelope } from "./governed-prompt-composer-mapper";
import type { GovernedPromptBuilderResult } from "./governed-prompt-composer";

export async function getGovernedPromptComposer(
  sessionId: string,
): Promise<GovernedPromptBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedPromptComposer(sessionId);
  return mapGovernedPromptEnvelope(envelope.data ?? envelope);
}

export type GovernedPromptReadAdapter = {
  getGovernedPromptComposer: typeof getGovernedPromptComposer;
};

export const composedPromptReadAdapter: GovernedPromptReadAdapter = {
  getGovernedPromptComposer,
};
