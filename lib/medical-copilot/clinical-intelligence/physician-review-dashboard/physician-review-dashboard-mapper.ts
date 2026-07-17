import {
  PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE,
  type PhysicianReviewDashboard,
  type PhysicianReviewDashboardBuilderResult,
  type PhysicianReviewDashboardSlot,
  type AiLayerProviderId,
} from "./physician-review-dashboard";

export function mapPhysicianReviewDashboardEnvelope(payload: unknown): PhysicianReviewDashboardBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "physician_review_dashboard"
      ? root
      : root.reviewDashboard && typeof root.reviewDashboard === "object" &&
          (root.reviewDashboard as { source?: string }).source === "physician_review_dashboard"
        ? (root.reviewDashboard as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianReviewDashboard(resultObj.reviewDashboard);
  if (!mapped) return null;
  return {
    source: "physician_review_dashboard",
    builderVersion: "1.0.0",
    reviewDashboard: mapped,
    governance: { ...PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapPhysicianReviewDashboard(raw: unknown): PhysicianReviewDashboard | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewDashboardId !== "string" || !String(r.reviewDashboardId).trim()) return null;
  if (!Array.isArray(r.dashboardSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.dashboardSlots.map(mapSlot).filter((s): s is PhysicianReviewDashboardSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewDashboardId: String(r.reviewDashboardId).trim(),
    providerId,
    dashboardSlots: slots,
    governance: { ...PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      checklistWorkspaceId: String(meta.checklistWorkspaceId ?? ""),
      reviewTimelineId: String(meta.reviewTimelineId ?? ""),
      reviewNavigationId: String(meta.reviewNavigationId ?? ""),
      reviewSummaryId: String(meta.reviewSummaryId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): PhysicianReviewDashboardSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "review_dashboard_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "review_dashboard_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
