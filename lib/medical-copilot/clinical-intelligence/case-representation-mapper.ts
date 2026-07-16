/**
 * CI-8 — Frontend mapper for Clinical Case Representation.
 */

import {
  CLINICAL_CASE_REPRESENTATION_GOVERNANCE,
  type ClinicalCaseRepresentation,
  type ClinicalCaseRepresentationResult,
  type ClinicalCaseSection,
  type ClinicalCaseSectionLayer,
} from "./case-representation";

export function mapCaseRepresentationEnvelope(
  payload: unknown,
): ClinicalCaseRepresentationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "clinical_case_representation_engine"
      ? root
      : root.representation &&
          typeof root.representation === "object" &&
          (root.representation as { source?: string }).source ===
            "clinical_case_representation_engine"
        ? (root.representation as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const representation = mapCaseRepresentation(resultObj.representation);
  if (!representation) return null;

  return {
    source: "clinical_case_representation_engine",
    engineVersion: "1.0.0",
    representation,
    governance: { ...CLINICAL_CASE_REPRESENTATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapCaseRepresentation(
  raw: unknown,
): ClinicalCaseRepresentation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.reviewId !== "string") return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;
  if (!Array.isArray(r.sections)) return null;

  const meta = r.metadata as Record<string, unknown>;
  const sections = r.sections
    .map(mapSection)
    .filter(Boolean) as ClinicalCaseSection[];

  return {
    reviewId: r.reviewId,
    sections,
    governance: { ...CLINICAL_CASE_REPRESENTATION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      snapshotId: String(meta.snapshotId ?? ""),
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
      sectionCount: Number(meta.sectionCount ?? sections.length),
      itemCount: Number(meta.itemCount ?? 0),
    },
  };
}

function mapSection(raw: unknown): ClinicalCaseSection | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== "string" || typeof s.title !== "string") return null;
  const layer = s.layer as ClinicalCaseSectionLayer;
  const valid = [
    "findings",
    "insights",
    "recommendations",
    "decisions",
    "reasoning",
  ];
  if (!valid.includes(layer)) return null;
  return {
    id: s.id,
    layer,
    title: s.title,
    itemIds: Array.isArray(s.itemIds) ? s.itemIds.map(String) : [],
    summaries: Array.isArray(s.summaries) ? s.summaries.map(String) : [],
  };
}
