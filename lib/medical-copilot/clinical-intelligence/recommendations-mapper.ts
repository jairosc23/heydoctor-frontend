/**
 * CI-3 — Frontend mapper for Clinical Recommendation Result.
 */

import {
  CLINICAL_RECOMMENDATION_GOVERNANCE,
  type ClinicalRecommendation,
  type ClinicalRecommendationCategory,
  type ClinicalRecommendationCollection,
  type ClinicalRecommendationPriority,
  type ClinicalRecommendationResult,
} from "./recommendations";

export function mapRecommendationsEnvelope(
  payload: unknown,
): ClinicalRecommendationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const recommendationsRoot =
    root.recommendations && typeof root.recommendations === "object"
      ? (root.recommendations as Record<string, unknown>)
      : root;

  if (recommendationsRoot.source !== "clinical_recommendation_engine") {
    return null;
  }
  const collectionRaw = recommendationsRoot.collection;
  if (!collectionRaw || typeof collectionRaw !== "object") return null;

  const recommendations = Array.isArray(
    (collectionRaw as { recommendations?: unknown }).recommendations,
  )
    ? ((collectionRaw as { recommendations: unknown[] }).recommendations
        .map(mapRecommendation)
        .filter(Boolean) as ClinicalRecommendation[])
    : [];

  return {
    source: "clinical_recommendation_engine",
    engineVersion: "1.0.0",
    sessionId: String(recommendationsRoot.sessionId ?? ""),
    consultationId: String(recommendationsRoot.consultationId ?? ""),
    patientId: String(recommendationsRoot.patientId ?? ""),
    status:
      recommendationsRoot.status === "ok" ||
      recommendationsRoot.status === "empty" ||
      recommendationsRoot.status === "partial"
        ? recommendationsRoot.status
        : "empty",
    collection: buildRecommendationCollection(recommendations),
    governance: { ...CLINICAL_RECOMMENDATION_GOVERNANCE },
    reason:
      typeof recommendationsRoot.reason === "string"
        ? recommendationsRoot.reason
        : null,
    generatedAt:
      typeof recommendationsRoot.generatedAt === "string"
        ? recommendationsRoot.generatedAt
        : new Date().toISOString(),
  };
}

export function mapRecommendation(
  raw: unknown,
): ClinicalRecommendation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.summary !== "string") return null;
  if (!Array.isArray(r.insightIds)) return null;
  return {
    id: r.id,
    category: (r.category as ClinicalRecommendationCategory) ?? "system",
    priority: (r.priority as ClinicalRecommendationPriority) ?? "low",
    source: "clinical_insights",
    confidence:
      typeof r.confidence === "number" && Number.isFinite(r.confidence)
        ? r.confidence
        : 0,
    summary: r.summary,
    insightIds: r.insightIds.map(String),
    references: Array.isArray(r.references)
      ? (r.references as ClinicalRecommendation["references"])
      : [],
    governance: { ...CLINICAL_RECOMMENDATION_GOVERNANCE },
  };
}

export function buildRecommendationCollection(
  recommendations: ClinicalRecommendation[],
): ClinicalRecommendationCollection {
  const byCategory: Partial<
    Record<ClinicalRecommendationCategory, ClinicalRecommendation[]>
  > = {};
  const byPriority: Partial<
    Record<ClinicalRecommendationPriority, ClinicalRecommendation[]>
  > = {};
  for (const recommendation of recommendations) {
    byCategory[recommendation.category] = [
      ...(byCategory[recommendation.category] ?? []),
      recommendation,
    ];
    byPriority[recommendation.priority] = [
      ...(byPriority[recommendation.priority] ?? []),
      recommendation,
    ];
  }
  return {
    recommendations: [...recommendations],
    byCategory,
    byPriority,
    count: recommendations.length,
  };
}
