/**
 * AI-18 — GovernedProviderExecutionResult contracts (frontend).
 */

export const GOVERNED_PROVIDER_EXECUTION_VERSION = "1.0.0" as const;

export const PROVIDER_EXECUTION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedProviderExecutionResultSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "provider_execution_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedProviderExecutionResultMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  templateId: string;
  composedPromptId: string;
  assemblyId: string;
  translationId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PROVIDER_EXECUTION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedProviderExecutionResult = {
  providerExecutionId: string;
  providerId: AiLayerProviderId;
  executionSlots: GovernedProviderExecutionResultSlot[];
  governance: typeof PROVIDER_EXECUTION_GOVERNANCE;
  metadata: GovernedProviderExecutionResultMetadata;
};

export type GovernedProviderExecutionResultBuilderResult = {
  source: "governed_provider_execution";
  builderVersion: typeof GOVERNED_PROVIDER_EXECUTION_VERSION;
  providerExecution: GovernedProviderExecutionResult;
  governance: typeof PROVIDER_EXECUTION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
