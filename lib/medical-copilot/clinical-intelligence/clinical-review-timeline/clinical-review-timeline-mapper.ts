import {
  CLINICAL_REVIEW_TIMELINE_GOVERNANCE,
  type ClinicalReviewTimeline,
  type ClinicalReviewTimelineBuilderResult,
  type ClinicalReviewTimelineSlot,
  type AiLayerProviderId,
} from "./clinical-review-timeline";

export function mapClinicalReviewTimelineEnvelope(payload: unknown): ClinicalReviewTimelineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_review_timeline"
      ? root
      : root.reviewTimeline && typeof root.reviewTimeline === "object" &&
          (root.reviewTimeline as { source?: string }).source === "clinical_review_timeline"
        ? (root.reviewTimeline as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReviewTimeline(resultObj.reviewTimeline);
  if (!mapped) return null;
  return {
    source: "clinical_review_timeline",
    builderVersion: "1.0.0",
    reviewTimeline: mapped,
    governance: { ...CLINICAL_REVIEW_TIMELINE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalReviewTimeline(raw: unknown): ClinicalReviewTimeline | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewTimelineId !== "string" || !String(r.reviewTimelineId).trim()) return null;
  if (!Array.isArray(r.timelineSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.timelineSlots.map(mapSlot).filter((s): s is ClinicalReviewTimelineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewTimelineId: String(r.reviewTimelineId).trim(),
    providerId,
    timelineSlots: slots,
    governance: { ...CLINICAL_REVIEW_TIMELINE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      physicianReviewPackageId: String(meta.physicianReviewPackageId ?? ""),
      validationWorkspaceId: String(meta.validationWorkspaceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalReviewTimelineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "review_timeline_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "review_timeline_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
