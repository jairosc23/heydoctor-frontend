/**
 * AI-8 — Read adapter for Governed Prompt Template (Facade only).
 */

import { getMedicalCopilotGovernedPromptTemplate } from "../../api";
import { mapGovernedPromptTemplateEnvelope } from "./governed-prompt-template-mapper";
import type { GovernedPromptTemplateBuilderResult } from "./governed-prompt-template";

export async function getGovernedPromptTemplate(
  sessionId: string,
): Promise<GovernedPromptTemplateBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedPromptTemplate(sessionId);
  return mapGovernedPromptTemplateEnvelope(envelope.data ?? envelope);
}

export type GovernedPromptTemplateReadAdapter = {
  getGovernedPromptTemplate: typeof getGovernedPromptTemplate;
};

export const governedPromptTemplateReadAdapter: GovernedPromptTemplateReadAdapter =
  {
    getGovernedPromptTemplate,
  };
