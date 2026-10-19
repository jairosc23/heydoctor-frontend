/**
 * AI-7 — Read adapter for Governed AI Prompt (Facade only).
 */

import { getMedicalCopilotGovernedAIPrompt } from "../../api";
import { mapGovernedAIPromptEnvelope } from "./governed-ai-prompt-mapper";
import type { GovernedAIPromptBuilderResult } from "./governed-ai-prompt";

export async function getGovernedAIPrompt(
  sessionId: string,
): Promise<GovernedAIPromptBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedAIPrompt(sessionId);
  return mapGovernedAIPromptEnvelope(envelope.data ?? envelope);
}

export type GovernedAIPromptReadAdapter = {
  getGovernedAIPrompt: typeof getGovernedAIPrompt;
};

export const governedAIPromptReadAdapter: GovernedAIPromptReadAdapter = {
  getGovernedAIPrompt,
};
