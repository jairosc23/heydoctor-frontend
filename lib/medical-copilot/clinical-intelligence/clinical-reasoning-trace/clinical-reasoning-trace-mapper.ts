import { CLINICAL_REASONING_TRACE_GOVERNANCE, type ClinicalReasoningTrace, type ClinicalReasoningTraceBuilderResult, type ClinicalReasoningTraceSlot, type AiLayerProviderId } from "./clinical-reasoning-trace";
export function mapClinicalReasoningTraceEnvelope(payload: unknown): ClinicalReasoningTraceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_trace" ? root : root.clinicalReasoningTrace && typeof root.clinicalReasoningTrace === "object" && (root.clinicalReasoningTrace as { source?: string }).source === "clinical_reasoning_trace" ? (root.clinicalReasoningTrace as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningTrace(resultObj.clinicalReasoningTrace);
  if (!mapped) return null;
  return { source: "clinical_reasoning_trace", builderVersion: "1.0.0", clinicalReasoningTrace: mapped, governance: { ...CLINICAL_REASONING_TRACE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningTrace(raw: unknown): ClinicalReasoningTrace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningTraceId !== "string" || !String(r.clinicalReasoningTraceId).trim()) return null;
  if (!Array.isArray(r.traceSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.traceSlots.map(mapSlot).filter((s): s is ClinicalReasoningTraceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningTraceId: String(r.clinicalReasoningTraceId).trim(), providerId, traceSlots: slots, governance: { ...CLINICAL_REASONING_TRACE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningGraphId: String(meta.clinicalReasoningGraphId ?? ""),
      reasoningExecutionContextId: String(meta.reasoningExecutionContextId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningTraceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_trace_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_trace_slot", status: slot.status, slotKey: slot.slotKey };
}
