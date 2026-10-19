import {
  GOVERNED_REVIEW_SESSION_GOVERNANCE,
  type GovernedReviewSession,
  type GovernedReviewSessionBuilderResult,
  type GovernedReviewSessionSlot,
  type AiLayerProviderId,
} from "./governed-review-session";

export function mapGovernedReviewSessionEnvelope(payload: unknown): GovernedReviewSessionBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_review_session"
      ? root
      : root.reviewSession && typeof root.reviewSession === "object" &&
          (root.reviewSession as { source?: string }).source === "governed_review_session"
        ? (root.reviewSession as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedReviewSession(resultObj.reviewSession);
  if (!mapped) return null;
  return {
    source: "governed_review_session",
    builderVersion: "1.0.0",
    reviewSession: mapped,
    governance: { ...GOVERNED_REVIEW_SESSION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedReviewSession(raw: unknown): GovernedReviewSession | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewSessionId !== "string" || !String(r.reviewSessionId).trim()) return null;
  if (!Array.isArray(r.sessionSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.sessionSlots.map(mapSlot).filter((s): s is GovernedReviewSessionSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewSessionId: String(r.reviewSessionId).trim(),
    providerId,
    sessionSlots: slots,
    governance: { ...GOVERNED_REVIEW_SESSION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      physicianReviewPackageId: String(meta.physicianReviewPackageId ?? ""),
      checklistWorkspaceId: String(meta.checklistWorkspaceId ?? ""),
      reviewTimelineId: String(meta.reviewTimelineId ?? ""),
      reviewNavigationId: String(meta.reviewNavigationId ?? ""),
      reviewDashboardId: String(meta.reviewDashboardId ?? ""),
      reviewSummaryId: String(meta.reviewSummaryId ?? ""),
      validationWorkspaceId: String(meta.validationWorkspaceId ?? ""),
      sessionPackageId: String(meta.sessionPackageId ?? ""),
      workspaceId: String(meta.workspaceId ?? ""),
      reviewWorkspaceV2Id: String(meta.reviewWorkspaceV2Id ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedReviewSessionSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "governed_review_session_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "governed_review_session_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
