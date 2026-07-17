/**
 * AI-16 — GovernedAssembledPrompt contracts (frontend).
 */

export const GOVERNED_PROMPT_ASSEMBLY_VERSION = "1.0.0" as const;

export const PROMPT_ASSEMBLY_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedAssembledPromptSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "assembly_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedAssembledPromptMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  templateId: string;
  composedPromptId: string;
  contextId: string;
  clinicalPlanId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PROMPT_ASSEMBLY_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedAssembledPrompt = {
  assemblyId: string;
  providerId: AiLayerProviderId;
  assemblySlots: GovernedAssembledPromptSlot[];
  governance: typeof PROMPT_ASSEMBLY_GOVERNANCE;
  metadata: GovernedAssembledPromptMetadata;
};

export type GovernedAssembledPromptBuilderResult = {
  source: "governed_prompt_assembly";
  builderVersion: typeof GOVERNED_PROMPT_ASSEMBLY_VERSION;
  assembledPrompt: GovernedAssembledPrompt;
  governance: typeof PROMPT_ASSEMBLY_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
