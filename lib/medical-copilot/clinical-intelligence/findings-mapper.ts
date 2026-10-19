/**
 * CI-1 — Frontend mapper for Clinical Intelligence Result / Findings.
 */

import {
  CLINICAL_INTELLIGENCE_GOVERNANCE,
  type ClinicalFinding,
  type ClinicalFindingCollection,
  type ClinicalFindingCategory,
  type ClinicalFindingSeverity,
  type ClinicalIntelligenceResult,
} from "./findings";

export function mapIntelligenceEnvelope(
  payload: unknown,
): ClinicalIntelligenceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const intelligence =
    root.intelligence && typeof root.intelligence === "object"
      ? (root.intelligence as Record<string, unknown>)
      : root;

  if (intelligence.source !== "clinical_intelligence_engine") return null;
  const collectionRaw = intelligence.collection;
  if (!collectionRaw || typeof collectionRaw !== "object") return null;

  const findings = Array.isArray(
    (collectionRaw as { findings?: unknown }).findings,
  )
    ? ((collectionRaw as { findings: unknown[] }).findings
        .map(mapFinding)
        .filter(Boolean) as ClinicalFinding[])
    : [];

  return {
    source: "clinical_intelligence_engine",
    engineVersion: "1.0.0",
    sessionId: String(intelligence.sessionId ?? ""),
    consultationId: String(intelligence.consultationId ?? ""),
    patientId: String(intelligence.patientId ?? ""),
    status:
      intelligence.status === "ok" ||
      intelligence.status === "empty" ||
      intelligence.status === "partial"
        ? intelligence.status
        : "empty",
    collection: buildCollection(findings),
    governance: { ...CLINICAL_INTELLIGENCE_GOVERNANCE },
    reason:
      typeof intelligence.reason === "string" ? intelligence.reason : null,
    generatedAt:
      typeof intelligence.generatedAt === "string"
        ? intelligence.generatedAt
        : new Date().toISOString(),
  };
}

export function mapFinding(raw: unknown): ClinicalFinding | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;
  if (typeof f.id !== "string" || typeof f.summary !== "string") return null;
  return {
    id: f.id,
    category: (f.category as ClinicalFindingCategory) ?? "system",
    severity: (f.severity as ClinicalFindingSeverity) ?? "info",
    source: (f.source as ClinicalFinding["source"]) ?? "session",
    confidence:
      typeof f.confidence === "number" && Number.isFinite(f.confidence)
        ? f.confidence
        : 0,
    summary: f.summary,
    references: Array.isArray(f.references)
      ? (f.references as ClinicalFinding["references"])
      : [],
    governance: { ...CLINICAL_INTELLIGENCE_GOVERNANCE },
  };
}

export function buildCollection(
  findings: ClinicalFinding[],
): ClinicalFindingCollection {
  const byCategory: Partial<
    Record<ClinicalFindingCategory, ClinicalFinding[]>
  > = {};
  const bySeverity: Partial<
    Record<ClinicalFindingSeverity, ClinicalFinding[]>
  > = {};
  for (const finding of findings) {
    byCategory[finding.category] = [
      ...(byCategory[finding.category] ?? []),
      finding,
    ];
    bySeverity[finding.severity] = [
      ...(bySeverity[finding.severity] ?? []),
      finding,
    ];
  }
  return {
    findings: [...findings],
    byCategory,
    bySeverity,
    count: findings.length,
  };
}
