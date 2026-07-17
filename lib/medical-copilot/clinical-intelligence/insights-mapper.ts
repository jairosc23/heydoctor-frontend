/**
 * CI-2 — Frontend mapper for Clinical Insight Result.
 */

import {
  CLINICAL_INSIGHT_GOVERNANCE,
  type ClinicalInsight,
  type ClinicalInsightCategory,
  type ClinicalInsightCollection,
  type ClinicalInsightResult,
  type ClinicalInsightSeverity,
} from "./insights";

export function mapInsightsEnvelope(
  payload: unknown,
): ClinicalInsightResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const insightsRoot =
    root.insights && typeof root.insights === "object"
      ? (root.insights as Record<string, unknown>)
      : root;

  if (insightsRoot.source !== "clinical_insight_engine") return null;
  const collectionRaw = insightsRoot.collection;
  if (!collectionRaw || typeof collectionRaw !== "object") return null;

  const insights = Array.isArray(
    (collectionRaw as { insights?: unknown }).insights,
  )
    ? ((collectionRaw as { insights: unknown[] }).insights
        .map(mapInsight)
        .filter(Boolean) as ClinicalInsight[])
    : [];

  return {
    source: "clinical_insight_engine",
    engineVersion: "1.0.0",
    sessionId: String(insightsRoot.sessionId ?? ""),
    consultationId: String(insightsRoot.consultationId ?? ""),
    patientId: String(insightsRoot.patientId ?? ""),
    status:
      insightsRoot.status === "ok" ||
      insightsRoot.status === "empty" ||
      insightsRoot.status === "partial"
        ? insightsRoot.status
        : "empty",
    collection: buildInsightCollection(insights),
    governance: { ...CLINICAL_INSIGHT_GOVERNANCE },
    reason:
      typeof insightsRoot.reason === "string" ? insightsRoot.reason : null,
    generatedAt:
      typeof insightsRoot.generatedAt === "string"
        ? insightsRoot.generatedAt
        : new Date().toISOString(),
  };
}

export function mapInsight(raw: unknown): ClinicalInsight | null {
  if (!raw || typeof raw !== "object") return null;
  const i = raw as Record<string, unknown>;
  if (typeof i.id !== "string" || typeof i.summary !== "string") return null;
  if (!Array.isArray(i.findingIds)) return null;
  return {
    id: i.id,
    category: (i.category as ClinicalInsightCategory) ?? "system",
    severity: (i.severity as ClinicalInsightSeverity) ?? "info",
    source: "clinical_findings",
    confidence:
      typeof i.confidence === "number" && Number.isFinite(i.confidence)
        ? i.confidence
        : 0,
    summary: i.summary,
    findingIds: i.findingIds.map(String),
    references: Array.isArray(i.references)
      ? (i.references as ClinicalInsight["references"])
      : [],
    governance: { ...CLINICAL_INSIGHT_GOVERNANCE },
  };
}

export function buildInsightCollection(
  insights: ClinicalInsight[],
): ClinicalInsightCollection {
  const byCategory: Partial<
    Record<ClinicalInsightCategory, ClinicalInsight[]>
  > = {};
  const bySeverity: Partial<
    Record<ClinicalInsightSeverity, ClinicalInsight[]>
  > = {};
  for (const insight of insights) {
    byCategory[insight.category] = [
      ...(byCategory[insight.category] ?? []),
      insight,
    ];
    bySeverity[insight.severity] = [
      ...(bySeverity[insight.severity] ?? []),
      insight,
    ];
  }
  return {
    insights: [...insights],
    byCategory,
    bySeverity,
    count: insights.length,
  };
}
