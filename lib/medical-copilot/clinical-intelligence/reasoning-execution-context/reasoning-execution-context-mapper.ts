import { REASONING_EXECUTION_CONTEXT_GOVERNANCE, type ReasoningExecutionContext, type ReasoningExecutionContextBuilderResult, type ReasoningExecutionContextSlot, type AiLayerProviderId } from "./reasoning-execution-context";
export function mapReasoningExecutionContextEnvelope(payload: unknown): ReasoningExecutionContextBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "reasoning_execution_context" ? root : root.reasoningExecutionContext && typeof root.reasoningExecutionContext === "object" && (root.reasoningExecutionContext as { source?: string }).source === "reasoning_execution_context" ? (root.reasoningExecutionContext as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapReasoningExecutionContext(resultObj.reasoningExecutionContext);
  if (!mapped) return null;
  return { source: "reasoning_execution_context", builderVersion: "1.0.0", reasoningExecutionContext: mapped, governance: { ...REASONING_EXECUTION_CONTEXT_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapReasoningExecutionContext(raw: unknown): ReasoningExecutionContext | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reasoningExecutionContextId !== "string" || !String(r.reasoningExecutionContextId).trim()) return null;
  if (!Array.isArray(r.executionContextSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.executionContextSlots.map(mapSlot).filter((s): s is ReasoningExecutionContextSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { reasoningExecutionContextId: String(r.reasoningExecutionContextId).trim(), providerId, executionContextSlots: slots, governance: { ...REASONING_EXECUTION_CONTEXT_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      reasoningRulePipelineId: String(meta.reasoningRulePipelineId ?? ""),
      clinicalReasoningContextId: String(meta.clinicalReasoningContextId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ReasoningExecutionContextSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "execution_context_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "execution_context_slot", status: slot.status, slotKey: slot.slotKey };
}
