/**
 * AI-1 — Frontend mapper for Governed AI Request.
 */

import {
  GOVERNED_AI_REQUEST_GOVERNANCE,
  type GovernedAIRequest,
  type GovernedAIRequestItem,
  type GovernedAIRequestItemKind,
  type GovernedAIRequestLayer,
  type GovernedAIRequestResult,
} from "./governed-ai-request";

export function mapGovernedAIRequestEnvelope(
  payload: unknown,
): GovernedAIRequestResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_ai_request_builder"
      ? root
      : root.request &&
          typeof root.request === "object" &&
          (root.request as { source?: string }).source ===
            "governed_ai_request_builder"
        ? (root.request as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const request = mapGovernedAIRequest(resultObj.request);
  if (!request) return null;

  return {
    source: "governed_ai_request_builder",
    builderVersion: "1.0.0",
    request,
    governance: { ...GOVERNED_AI_REQUEST_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedAIRequest(
  raw: unknown,
): GovernedAIRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.planId !== "string") return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;
  if (!Array.isArray(r.requestItems)) return null;

  const meta = r.metadata as Record<string, unknown>;
  const requestItems = r.requestItems
    .map(mapRequestItem)
    .filter(Boolean) as GovernedAIRequestItem[];

  return {
    planId: r.planId,
    requestItems,
    governance: { ...GOVERNED_AI_REQUEST_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      snapshotId: String(meta.snapshotId ?? ""),
      reviewId: String(meta.reviewId ?? ""),
      contextId: String(meta.contextId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      builderVersion: "1.0.0",
      status:
        meta.status === "ok" ||
        meta.status === "empty" ||
        meta.status === "partial"
          ? meta.status
          : "empty",
      itemCount: Number(meta.itemCount ?? requestItems.length),
    },
  };
}

function mapRequestItem(raw: unknown): GovernedAIRequestItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.sourcePlanItemId !== "string" ||
    typeof item.summary !== "string"
  ) {
    return null;
  }
  const kind = item.kind as GovernedAIRequestItemKind;
  const validKinds = ["to_review", "pending", "available", "missing"];
  if (!validKinds.includes(kind)) return null;
  const layer = item.layer as GovernedAIRequestLayer;
  const validLayers = [
    "findings",
    "insights",
    "recommendations",
    "decisions",
    "reasoning",
  ];
  if (!validLayers.includes(layer)) return null;
  return {
    id: item.id,
    sourcePlanItemId: item.sourcePlanItemId,
    kind,
    order: Number(item.order ?? 0),
    layer,
    summary: item.summary,
  };
}
