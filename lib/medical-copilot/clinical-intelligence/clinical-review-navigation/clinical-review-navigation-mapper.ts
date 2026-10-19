import {
  CLINICAL_REVIEW_NAVIGATION_GOVERNANCE,
  type ClinicalReviewNavigation,
  type ClinicalReviewNavigationBuilderResult,
  type ClinicalReviewNavigationSlot,
  type AiLayerProviderId,
} from "./clinical-review-navigation";

export function mapClinicalReviewNavigationEnvelope(payload: unknown): ClinicalReviewNavigationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_review_navigation"
      ? root
      : root.reviewNavigation && typeof root.reviewNavigation === "object" &&
          (root.reviewNavigation as { source?: string }).source === "clinical_review_navigation"
        ? (root.reviewNavigation as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReviewNavigation(resultObj.reviewNavigation);
  if (!mapped) return null;
  return {
    source: "clinical_review_navigation",
    builderVersion: "1.0.0",
    reviewNavigation: mapped,
    governance: { ...CLINICAL_REVIEW_NAVIGATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalReviewNavigation(raw: unknown): ClinicalReviewNavigation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewNavigationId !== "string" || !String(r.reviewNavigationId).trim()) return null;
  if (!Array.isArray(r.navigationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.navigationSlots.map(mapSlot).filter((s): s is ClinicalReviewNavigationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewNavigationId: String(r.reviewNavigationId).trim(),
    providerId,
    navigationSlots: slots,
    governance: { ...CLINICAL_REVIEW_NAVIGATION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      reviewTimelineId: String(meta.reviewTimelineId ?? ""),
      checklistWorkspaceId: String(meta.checklistWorkspaceId ?? ""),
      validationWorkspaceId: String(meta.validationWorkspaceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalReviewNavigationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "review_navigation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "review_navigation_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
