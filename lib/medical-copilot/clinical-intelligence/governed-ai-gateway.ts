/**
 * AI-3 — Governed AI Gateway contracts (frontend).
 * Empty governed gateway response — no LLM, SDKs, or external APIs.
 */

export const GOVERNED_AI_GATEWAY_VERSION = "1.0.0" as const;

export const GATEWAY_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type GatewayProviderId = "noop" | "openai";

export type GatewayMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  generatedAt: string;
  gatewayVersion: typeof GOVERNED_AI_GATEWAY_VERSION;
  status: "ok" | "empty" | "rejected";
  selectedProviderId: GatewayProviderId;
};

export type GatewayResponse = {
  providerId: GatewayProviderId;
  accepted: boolean;
  governance: typeof GATEWAY_GOVERNANCE;
  metadata: GatewayMetadata;
};

export type GovernedAIGatewayResult = {
  source: "governed_ai_gateway";
  gatewayVersion: typeof GOVERNED_AI_GATEWAY_VERSION;
  response: GatewayResponse;
  governance: typeof GATEWAY_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
