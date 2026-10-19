import {
  PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE,
  type PhysicianReviewSummary,
  type PhysicianReviewSummaryBuilderResult,
  type PhysicianReviewSummarySlot,
  type AiLayerProviderId,
} from "./physician-review-summary";

export function mapPhysicianReviewSummaryEnvelope(payload: unknown): PhysicianReviewSummaryBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "physician_review_summary"
      ? root
      : root.reviewSummary && typeof root.reviewSummary === "object" &&
          (root.reviewSummary as { source?: string }).source === "physician_review_summary"
        ? (root.reviewSummary as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianReviewSummary(resultObj.reviewSummary);
  if (!mapped) return null;
  return {
    source: "physician_review_summary",
    builderVersion: "1.0.0",
    reviewSummary: mapped,
    governance: { ...PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapPhysicianReviewSummary(raw: unknown): PhysicianReviewSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewSummaryId !== "string" || !String(r.reviewSummaryId).trim()) return null;
  if (!Array.isArray(r.summarySlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.summarySlots.map(mapSlot).filter((s): s is PhysicianReviewSummarySlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewSummaryId: String(r.reviewSummaryId).trim(),
    providerId,
    summarySlots: slots,
    governance: { ...PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      validationWorkspaceId: String(meta.validationWorkspaceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): PhysicianReviewSummarySlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "review_summary_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "review_summary_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
