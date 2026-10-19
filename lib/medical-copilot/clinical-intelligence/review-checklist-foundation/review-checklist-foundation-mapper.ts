import {
  REVIEW_CHECKLIST_GOVERNANCE,
  type ReviewChecklistFoundation,
  type ReviewChecklistFoundationBuilderResult,
  type ReviewChecklistFoundationSlot,
  type AiLayerProviderId,
} from "./review-checklist-foundation";

export function mapReviewChecklistFoundationEnvelope(payload: unknown): ReviewChecklistFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "review_checklist_foundation"
      ? root
      : root.checklist && typeof root.checklist === "object" &&
          (root.checklist as { source?: string }).source === "review_checklist_foundation"
        ? (root.checklist as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapReviewChecklistFoundation(resultObj.checklist);
  if (!mapped) return null;
  return {
    source: "review_checklist_foundation",
    builderVersion: "1.0.0",
    checklist: mapped,
    governance: { ...REVIEW_CHECKLIST_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapReviewChecklistFoundation(raw: unknown): ReviewChecklistFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.checklistId !== "string" || !String(r.checklistId).trim()) return null;
  if (!Array.isArray(r.checklistSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.checklistSlots.map(mapSlot).filter((s): s is ReviewChecklistFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    checklistId: String(r.checklistId).trim(),
    providerId,
    checklistSlots: slots,
    governance: { ...REVIEW_CHECKLIST_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      reviewDatasetId: String(meta.reviewDatasetId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ReviewChecklistFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "review_checklist_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "review_checklist_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
