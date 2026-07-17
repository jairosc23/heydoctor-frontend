/**
 * AI-1 — Governed AI Request contracts (frontend).
 * Stable ingress contract from ClinicalPlan — no LLM, prompts, or EMR writes.
 */

export const GOVERNED_AI_REQUEST_BUILDER_VERSION = "1.0.0" as const;

export const GOVERNED_AI_REQUEST_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type GovernedAIRequestItemKind =
  | "to_review"
  | "pending"
  | "available"
  | "missing";

export type GovernedAIRequestLayer =
  | "findings"
  | "insights"
  | "recommendations"
  | "decisions"
  | "reasoning";

export type GovernedAIRequestItem = {
  id: string;
  sourcePlanItemId: string;
  kind: GovernedAIRequestItemKind;
  order: number;
  layer: GovernedAIRequestLayer;
  summary: string;
};

export type GovernedAIRequestMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  snapshotId: string;
  reviewId: string;
  contextId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_AI_REQUEST_BUILDER_VERSION;
  status: "ok" | "empty" | "partial";
  itemCount: number;
};

export type GovernedAIRequest = {
  planId: string;
  requestItems: GovernedAIRequestItem[];
  governance: typeof GOVERNED_AI_REQUEST_GOVERNANCE;
  metadata: GovernedAIRequestMetadata;
};

export type GovernedAIRequestResult = {
  source: "governed_ai_request_builder";
  builderVersion: typeof GOVERNED_AI_REQUEST_BUILDER_VERSION;
  request: GovernedAIRequest;
  governance: typeof GOVERNED_AI_REQUEST_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
