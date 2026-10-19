/**
 * AI-6 — Frontend mapper for Governed AI Clinical Response.
 */

import {
  CLINICAL_RESPONSE_GOVERNANCE,
  type ClinicalResponseProviderId,
  type GovernedAIClinicalResponse,
  type GovernedAIClinicalResponseBuilderResult,
  type GovernedAIClinicalResponseItem,
} from "./governed-ai-clinical-response";

export function mapGovernedAIClinicalResponseEnvelope(
  payload: unknown,
): GovernedAIClinicalResponseBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_ai_clinical_response"
      ? root
      : root.clinicalResponse &&
          typeof root.clinicalResponse === "object" &&
          (root.clinicalResponse as { source?: string }).source ===
            "governed_ai_clinical_response"
        ? (root.clinicalResponse as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const response = mapGovernedAIClinicalResponse(resultObj.response);
  if (!response) return null;

  return {
    source: "governed_ai_clinical_response",
    builderVersion: "1.0.0",
    response,
    governance: { ...CLINICAL_RESPONSE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedAIClinicalResponse(
  raw: unknown,
): GovernedAIClinicalResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.responseId !== "string" || !r.responseId.trim()) return null;
  if (!Array.isArray(r.responseItems)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const items = r.responseItems
    .map(mapResponseItem)
    .filter((item): item is GovernedAIClinicalResponseItem => item !== null);

  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as ClinicalResponseProviderId;
  const selected =
    meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai"
      ? meta.selectedProviderId
      : providerId;
  const status =
    meta.status === "ok" ||
    meta.status === "empty" ||
    meta.status === "rejected"
      ? meta.status
      : "empty";

  return {
    responseId: r.responseId.trim(),
    providerId,
    responseItems: items,
    governance: { ...CLINICAL_RESPONSE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      executionId: String(meta.executionId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      itemCount:
        typeof meta.itemCount === "number" ? meta.itemCount : items.length,
      selectedProviderId: selected,
    },
  };
}

function mapResponseItem(
  raw: unknown,
): GovernedAIClinicalResponseItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "string" || !item.id.trim()) return null;
  if (typeof item.sourceExecutionId !== "string") return null;
  if (typeof item.order !== "number") return null;
  if (item.kind !== "execution_ack") return null;
  if (
    item.status !== "ok" &&
    item.status !== "empty" &&
    item.status !== "rejected"
  ) {
    return null;
  }
  if (typeof item.summary !== "string") return null;

  return {
    id: item.id.trim(),
    sourceExecutionId: item.sourceExecutionId,
    order: item.order,
    kind: "execution_ack",
    status: item.status,
    summary: item.summary,
  };
}
