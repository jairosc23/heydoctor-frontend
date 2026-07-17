/**
 * AI-3 — Frontend mapper for Governed AI Gateway.
 */

import {
  GATEWAY_GOVERNANCE,
  type GatewayProviderId,
  type GatewayResponse,
  type GovernedAIGatewayResult,
} from "./governed-ai-gateway";

export function mapGovernedAIGatewayEnvelope(
  payload: unknown,
): GovernedAIGatewayResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_ai_gateway"
      ? root
      : root.gateway &&
          typeof root.gateway === "object" &&
          (root.gateway as { source?: string }).source === "governed_ai_gateway"
        ? (root.gateway as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const response = mapGatewayResponse(resultObj.response);
  if (!response) return null;

  return {
    source: "governed_ai_gateway",
    gatewayVersion: "1.0.0",
    response,
    governance: { ...GATEWAY_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGatewayResponse(raw: unknown): GatewayResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.accepted !== "boolean") return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as GatewayProviderId;

  const selected =
    meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai"
      ? meta.selectedProviderId
      : providerId;

  return {
    providerId,
    accepted: r.accepted,
    governance: { ...GATEWAY_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      gatewayVersion: "1.0.0",
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
