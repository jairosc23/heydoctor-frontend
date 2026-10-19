import { PHYSICIAN_REASONING_REVIEW_GOVERNANCE, type PhysicianReasoningReview, type PhysicianReasoningReviewBuilderResult, type PhysicianReasoningReviewSlot, type AiLayerProviderId } from "./physician-reasoning-review";
export function mapPhysicianReasoningReviewEnvelope(payload: unknown): PhysicianReasoningReviewBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "physician_reasoning_review" ? root : root.physicianReasoningReview && typeof root.physicianReasoningReview === "object" && (root.physicianReasoningReview as { source?: string }).source === "physician_reasoning_review" ? (root.physicianReasoningReview as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianReasoningReview(resultObj.physicianReasoningReview);
  if (!mapped) return null;
  return { source: "physician_reasoning_review", builderVersion: "1.0.0", physicianReasoningReview: mapped, governance: { ...PHYSICIAN_REASONING_REVIEW_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapPhysicianReasoningReview(raw: unknown): PhysicianReasoningReview | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.physicianReasoningReviewId !== "string" || !String(r.physicianReasoningReviewId).trim()) return null;
  if (!Array.isArray(r.reviewSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.reviewSlots.map(mapSlot).filter((s): s is PhysicianReasoningReviewSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { physicianReasoningReviewId: String(r.physicianReasoningReviewId).trim(), providerId, reviewSlots: slots, governance: { ...PHYSICIAN_REASONING_REVIEW_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      reasoningQualityEngineId: String(meta.reasoningQualityEngineId ?? ""),
      reviewSessionId: String(meta.reviewSessionId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): PhysicianReasoningReviewSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "physician_reasoning_review_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "physician_reasoning_review_slot", status: slot.status, slotKey: slot.slotKey };
}
