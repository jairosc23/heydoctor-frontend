/**
 * CI-9 — Frontend mapper for Clinical Context.
 */

import {
  CLINICAL_CONTEXT_GOVERNANCE,
  type ClinicalContext,
  type ClinicalContextItem,
  type ClinicalContextLayer,
  type ClinicalContextResult,
} from "./clinical-context";

export function mapClinicalContextEnvelope(
  payload: unknown,
): ClinicalContextResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "clinical_context_engine"
      ? root
      : root.context &&
          typeof root.context === "object" &&
          (root.context as { source?: string }).source ===
            "clinical_context_engine"
        ? (root.context as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const context = mapClinicalContext(resultObj.context);
  if (!context) return null;

  return {
    source: "clinical_context_engine",
    engineVersion: "1.0.0",
    context,
    governance: { ...CLINICAL_CONTEXT_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapClinicalContext(raw: unknown): ClinicalContext | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.caseRepresentationId !== "string") return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;
  if (!Array.isArray(r.contextItems)) return null;

  const meta = r.metadata as Record<string, unknown>;
  const contextItems = r.contextItems
    .map(mapContextItem)
    .filter(Boolean) as ClinicalContextItem[];

  return {
    caseRepresentationId: r.caseRepresentationId,
    contextItems,
    governance: { ...CLINICAL_CONTEXT_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      snapshotId: String(meta.snapshotId ?? ""),
      reviewId: String(meta.reviewId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      engineVersion: "1.0.0",
      status:
        meta.status === "ok" ||
        meta.status === "empty" ||
        meta.status === "partial"
          ? meta.status
          : "empty",
      itemCount: Number(meta.itemCount ?? contextItems.length),
    },
  };
}

function mapContextItem(raw: unknown): ClinicalContextItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.sectionId !== "string") {
    return null;
  }
  if (typeof item.sourceItemId !== "string" || typeof item.summary !== "string") {
    return null;
  }
  const layer = item.layer as ClinicalContextLayer;
  const valid = [
    "findings",
    "insights",
    "recommendations",
    "decisions",
    "reasoning",
  ];
  if (!valid.includes(layer)) return null;
  return {
    id: item.id,
    sectionId: item.sectionId,
    layer,
    sourceItemId: item.sourceItemId,
    summary: item.summary,
  };
}
