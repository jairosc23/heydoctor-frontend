/**
 * CI-7 — Frontend mapper for Governed Clinical Review.
 */

import {
  CLINICAL_REVIEW_GOVERNANCE,
  type ClinicalReview,
  type ClinicalReviewItem,
  type ClinicalReviewLayer,
  type ClinicalReviewResult,
} from "./review";

export function mapReviewEnvelope(
  payload: unknown,
): ClinicalReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_clinical_review_engine"
      ? root
      : root.review &&
          typeof root.review === "object" &&
          (root.review as { source?: string }).source ===
            "governed_clinical_review_engine"
        ? (root.review as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const review = mapReview(resultObj.review);
  if (!review) return null;

  return {
    source: "governed_clinical_review_engine",
    engineVersion: "1.0.0",
    review,
    governance: { ...CLINICAL_REVIEW_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapReview(raw: unknown): ClinicalReview | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.snapshotId !== "string") return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;
  if (!Array.isArray(r.reviewItems)) return null;

  const meta = r.metadata as Record<string, unknown>;
  const reviewItems = r.reviewItems
    .map(mapReviewItem)
    .filter(Boolean) as ClinicalReviewItem[];

  return {
    snapshotId: r.snapshotId,
    reviewItems,
    governance: { ...CLINICAL_REVIEW_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
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
      itemCount: Number(meta.itemCount ?? reviewItems.length),
    },
  };
}

function mapReviewItem(raw: unknown): ClinicalReviewItem | null {
  if (!raw || typeof raw !== "object") return null;
  const i = raw as Record<string, unknown>;
  if (typeof i.id !== "string" || typeof i.summary !== "string") return null;
  if (typeof i.sourceId !== "string") return null;
  const layer = i.layer as ClinicalReviewLayer;
  const validLayers = [
    "findings",
    "insights",
    "recommendations",
    "decisions",
    "reasoning",
  ];
  if (!validLayers.includes(layer)) return null;
  return {
    id: i.id,
    layer,
    sourceId: i.sourceId,
    category: typeof i.category === "string" ? i.category : "system",
    summary: i.summary,
  };
}
