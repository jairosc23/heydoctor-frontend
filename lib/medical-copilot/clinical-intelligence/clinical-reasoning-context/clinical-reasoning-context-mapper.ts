import { CLINICAL_REASONING_CONTEXT_GOVERNANCE, type ClinicalReasoningContext, type ClinicalReasoningContextBuilderResult, type ClinicalReasoningContextSlot, type AiLayerProviderId } from "./clinical-reasoning-context";
export function mapClinicalReasoningContextEnvelope(payload: unknown): ClinicalReasoningContextBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_context" ? root : root.clinicalReasoningContext && typeof root.clinicalReasoningContext === "object" && (root.clinicalReasoningContext as { source?: string }).source === "clinical_reasoning_context" ? (root.clinicalReasoningContext as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningContext(resultObj.clinicalReasoningContext);
  if (!mapped) return null;
  return { source: "clinical_reasoning_context", builderVersion: "1.0.0", clinicalReasoningContext: mapped, governance: { ...CLINICAL_REASONING_CONTEXT_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningContext(raw: unknown): ClinicalReasoningContext | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningContextId !== "string" || !String(r.clinicalReasoningContextId).trim()) return null;
  if (!Array.isArray(r.contextSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.contextSlots.map(mapSlot).filter((s): s is ClinicalReasoningContextSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningContextId: String(r.clinicalReasoningContextId).trim(), providerId, contextSlots: slots, governance: { ...CLINICAL_REASONING_CONTEXT_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedClinicalReasoningDatasetId: String(meta.governedClinicalReasoningDatasetId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningContextSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_context_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_context_slot", status: slot.status, slotKey: slot.slotKey };
}
