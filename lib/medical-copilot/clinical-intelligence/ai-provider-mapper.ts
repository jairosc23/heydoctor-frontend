/**
 * AI-2 — Frontend mapper for AI Provider Route.
 */

import {
  AI_PROVIDER_GOVERNANCE,
  type AIProviderCapabilities,
  type AIProviderId,
  type AIProviderResponse,
  type AIProviderRouteResult,
} from "./ai-provider";

export function mapAIProviderRouteEnvelope(
  payload: unknown,
): AIProviderRouteResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "ai_provider_router"
      ? root
      : root.route &&
          typeof root.route === "object" &&
          (root.route as { source?: string }).source === "ai_provider_router"
        ? (root.route as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const response = mapAIProviderResponse(resultObj.response);
  if (!response) return null;

  return {
    source: "ai_provider_router",
    routerVersion: "1.0.0",
    response,
    governance: { ...AI_PROVIDER_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapAIProviderResponse(
  raw: unknown,
): AIProviderResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.accepted !== "boolean") return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;
  if (!r.capabilities || typeof r.capabilities !== "object") return null;

  const meta = r.metadata as Record<string, unknown>;
  const caps = r.capabilities as Record<string, unknown>;
  const providerId = r.providerId as AIProviderId;

  const capabilities: AIProviderCapabilities = {
    supportsChat: Boolean(caps.supportsChat),
    supportsStreaming: Boolean(caps.supportsStreaming),
    supportsTools: Boolean(caps.supportsTools),
    supportsEmbeddings: Boolean(caps.supportsEmbeddings),
    supportsCompletions: Boolean(caps.supportsCompletions),
  };

  const selected =
    meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai"
      ? meta.selectedProviderId
      : providerId;

  return {
    providerId,
    accepted: r.accepted,
    capabilities,
    governance: { ...AI_PROVIDER_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      routerVersion: "1.0.0",
      status:
        meta.status === "ok" ||
        meta.status === "empty" ||
        meta.status === "rejected"
          ? meta.status
          : "empty",
      selectedProviderId: selected,
    },
  };
}
