/**
 * AI-2 — AI Provider Abstraction contracts (frontend).
 */

export const AI_PROVIDER_ROUTER_VERSION = "1.0.0" as const;

export const AI_PROVIDER_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AIProviderId = "noop" | "openai";

export type AIProviderCapabilities = {
  supportsChat: boolean;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsEmbeddings: boolean;
  supportsCompletions: boolean;
};

export type AIProviderResponseMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  generatedAt: string;
  routerVersion: typeof AI_PROVIDER_ROUTER_VERSION;
  status: "ok" | "empty" | "rejected";
  selectedProviderId: AIProviderId;
};

export type AIProviderResponse = {
  providerId: AIProviderId;
  accepted: boolean;
  capabilities: AIProviderCapabilities;
  governance: typeof AI_PROVIDER_GOVERNANCE;
  metadata: AIProviderResponseMetadata;
};

export type AIProviderRouteResult = {
  source: "ai_provider_router";
  routerVersion: typeof AI_PROVIDER_ROUTER_VERSION;
  response: AIProviderResponse;
  governance: typeof AI_PROVIDER_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
