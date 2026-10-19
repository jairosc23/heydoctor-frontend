/**
 * CI-5 — Frontend mapper for Governed Clinical Reasoning Result.
 */

import {
  GOVERNED_CLINICAL_REASONING_GOVERNANCE,
  type ClinicalReasoning,
  type ClinicalReasoningCategory,
  type ClinicalReasoningCollection,
  type ClinicalReasoningResult,
} from "./reasoning";

export function mapReasoningEnvelope(
  payload: unknown,
): ClinicalReasoningResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const reasoningRoot =
    root.reasoning && typeof root.reasoning === "object"
      ? (root.reasoning as Record<string, unknown>)
      : root;

  if (reasoningRoot.source !== "governed_clinical_reasoning_engine") {
    return null;
  }
  const collectionRaw = reasoningRoot.collection;
  if (!collectionRaw || typeof collectionRaw !== "object") return null;

  const reasonings = Array.isArray(
    (collectionRaw as { reasonings?: unknown }).reasonings,
  )
    ? ((collectionRaw as { reasonings: unknown[] }).reasonings
        .map(mapReasoning)
        .filter(Boolean) as ClinicalReasoning[])
    : [];

  return {
    source: "governed_clinical_reasoning_engine",
    engineVersion: "1.0.0",
    sessionId: String(reasoningRoot.sessionId ?? ""),
    consultationId: String(reasoningRoot.consultationId ?? ""),
    patientId: String(reasoningRoot.patientId ?? ""),
    status:
      reasoningRoot.status === "ok" ||
      reasoningRoot.status === "empty" ||
      reasoningRoot.status === "partial"
        ? reasoningRoot.status
        : "empty",
    collection: buildReasoningCollection(reasonings),
    governance: { ...GOVERNED_CLINICAL_REASONING_GOVERNANCE },
    reason:
      typeof reasoningRoot.reason === "string" ? reasoningRoot.reason : null,
    generatedAt:
      typeof reasoningRoot.generatedAt === "string"
        ? reasoningRoot.generatedAt
        : new Date().toISOString(),
  };
}

export function mapReasoning(raw: unknown): ClinicalReasoning | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.summary !== "string") return null;
  if (!Array.isArray(r.decisionIds)) return null;
  return {
    id: r.id,
    category: (r.category as ClinicalReasoningCategory) ?? "system",
    confidence:
      typeof r.confidence === "number" && Number.isFinite(r.confidence)
        ? r.confidence
        : 0,
    source: "clinical_decisions",
    summary: r.summary,
    decisionIds: r.decisionIds.map(String),
    references: Array.isArray(r.references)
      ? (r.references as ClinicalReasoning["references"])
      : [],
    governance: { ...GOVERNED_CLINICAL_REASONING_GOVERNANCE },
  };
}

export function buildReasoningCollection(
  reasonings: ClinicalReasoning[],
): ClinicalReasoningCollection {
  const byCategory: Partial<
    Record<ClinicalReasoningCategory, ClinicalReasoning[]>
  > = {};
  for (const reasoning of reasonings) {
    byCategory[reasoning.category] = [
      ...(byCategory[reasoning.category] ?? []),
      reasoning,
    ];
  }
  return {
    reasonings: [...reasonings],
    byCategory,
    count: reasonings.length,
  };
}
