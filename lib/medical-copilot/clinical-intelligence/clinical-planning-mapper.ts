/**
 * CI-10 — Frontend mapper for Clinical Plan.
 */

import {
  CLINICAL_PLANNING_GOVERNANCE,
  type ClinicalPlan,
  type ClinicalPlanItem,
  type ClinicalPlanItemKind,
  type ClinicalPlanLayer,
  type ClinicalPlanResult,
} from "./clinical-planning";

export function mapClinicalPlanEnvelope(
  payload: unknown,
): ClinicalPlanResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "clinical_planning_engine"
      ? root
      : root.plan &&
          typeof root.plan === "object" &&
          (root.plan as { source?: string }).source ===
            "clinical_planning_engine"
        ? (root.plan as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const plan = mapClinicalPlan(resultObj.plan);
  if (!plan) return null;

  return {
    source: "clinical_planning_engine",
    engineVersion: "1.0.0",
    plan,
    governance: { ...CLINICAL_PLANNING_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapClinicalPlan(raw: unknown): ClinicalPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.contextId !== "string") return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;
  if (!Array.isArray(r.planItems)) return null;

  const meta = r.metadata as Record<string, unknown>;
  const planItems = r.planItems
    .map(mapPlanItem)
    .filter(Boolean) as ClinicalPlanItem[];

  return {
    contextId: r.contextId,
    planItems,
    governance: { ...CLINICAL_PLANNING_GOVERNANCE },
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
      itemCount: Number(meta.itemCount ?? planItems.length),
      toReviewCount: Number(meta.toReviewCount ?? 0),
      pendingCount: Number(meta.pendingCount ?? 0),
      availableCount: Number(meta.availableCount ?? 0),
      missingCount: Number(meta.missingCount ?? 0),
    },
  };
}

function mapPlanItem(raw: unknown): ClinicalPlanItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.summary !== "string") {
    return null;
  }
  const kind = item.kind as ClinicalPlanItemKind;
  const validKinds = ["to_review", "pending", "available", "missing"];
  if (!validKinds.includes(kind)) return null;
  const layer = item.layer as ClinicalPlanLayer;
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
    kind,
    order: Number(item.order ?? 0),
    layer,
    sourceContextItemId:
      typeof item.sourceContextItemId === "string"
        ? item.sourceContextItemId
        : null,
    summary: item.summary,
  };
}
