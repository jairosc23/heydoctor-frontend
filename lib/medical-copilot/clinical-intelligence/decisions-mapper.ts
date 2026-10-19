/**
 * CI-4 — Frontend mapper for Clinical Decision Support Result.
 */

import {
  CLINICAL_DECISION_SUPPORT_GOVERNANCE,
  type ClinicalDecision,
  type ClinicalDecisionCategory,
  type ClinicalDecisionCollection,
  type ClinicalDecisionPriority,
  type ClinicalDecisionResult,
} from "./decisions";

export function mapDecisionsEnvelope(
  payload: unknown,
): ClinicalDecisionResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const decisionsRoot =
    root.decisions && typeof root.decisions === "object"
      ? (root.decisions as Record<string, unknown>)
      : root;

  if (decisionsRoot.source !== "clinical_decision_support_engine") {
    return null;
  }
  const collectionRaw = decisionsRoot.collection;
  if (!collectionRaw || typeof collectionRaw !== "object") return null;

  const decisions = Array.isArray(
    (collectionRaw as { decisions?: unknown }).decisions,
  )
    ? ((collectionRaw as { decisions: unknown[] }).decisions
        .map(mapDecision)
        .filter(Boolean) as ClinicalDecision[])
    : [];

  return {
    source: "clinical_decision_support_engine",
    engineVersion: "1.0.0",
    sessionId: String(decisionsRoot.sessionId ?? ""),
    consultationId: String(decisionsRoot.consultationId ?? ""),
    patientId: String(decisionsRoot.patientId ?? ""),
    status:
      decisionsRoot.status === "ok" ||
      decisionsRoot.status === "empty" ||
      decisionsRoot.status === "partial"
        ? decisionsRoot.status
        : "empty",
    collection: buildDecisionCollection(decisions),
    governance: { ...CLINICAL_DECISION_SUPPORT_GOVERNANCE },
    reason:
      typeof decisionsRoot.reason === "string" ? decisionsRoot.reason : null,
    generatedAt:
      typeof decisionsRoot.generatedAt === "string"
        ? decisionsRoot.generatedAt
        : new Date().toISOString(),
  };
}

export function mapDecision(raw: unknown): ClinicalDecision | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (typeof d.id !== "string" || typeof d.summary !== "string") return null;
  if (!Array.isArray(d.recommendationIds)) return null;
  return {
    id: d.id,
    category: (d.category as ClinicalDecisionCategory) ?? "system",
    priority: (d.priority as ClinicalDecisionPriority) ?? "low",
    source: "clinical_recommendations",
    confidence:
      typeof d.confidence === "number" && Number.isFinite(d.confidence)
        ? d.confidence
        : 0,
    summary: d.summary,
    recommendationIds: d.recommendationIds.map(String),
    references: Array.isArray(d.references)
      ? (d.references as ClinicalDecision["references"])
      : [],
    governance: { ...CLINICAL_DECISION_SUPPORT_GOVERNANCE },
  };
}

export function buildDecisionCollection(
  decisions: ClinicalDecision[],
): ClinicalDecisionCollection {
  const byCategory: Partial<
    Record<ClinicalDecisionCategory, ClinicalDecision[]>
  > = {};
  const byPriority: Partial<
    Record<ClinicalDecisionPriority, ClinicalDecision[]>
  > = {};
  for (const decision of decisions) {
    byCategory[decision.category] = [
      ...(byCategory[decision.category] ?? []),
      decision,
    ];
    byPriority[decision.priority] = [
      ...(byPriority[decision.priority] ?? []),
      decision,
    ];
  }
  return {
    decisions: [...decisions],
    byCategory,
    byPriority,
    count: decisions.length,
  };
}
