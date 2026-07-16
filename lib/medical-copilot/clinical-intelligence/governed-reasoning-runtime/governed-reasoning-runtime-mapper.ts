import { GOVERNED_REASONING_RUNTIME_GOVERNANCE, type GovernedReasoningRuntime, type GovernedReasoningRuntimeBuilderResult, type GovernedReasoningRuntimeSlot, type AiLayerProviderId } from "./governed-reasoning-runtime";
export function mapGovernedReasoningRuntimeEnvelope(payload: unknown): GovernedReasoningRuntimeBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "governed_reasoning_runtime" ? root : root.governedReasoningRuntime && typeof root.governedReasoningRuntime === "object" && (root.governedReasoningRuntime as { source?: string }).source === "governed_reasoning_runtime" ? (root.governedReasoningRuntime as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapGovernedReasoningRuntime(resultObj.governedReasoningRuntime);
  if (!mapped) return null;
  return { source: "governed_reasoning_runtime", builderVersion: "1.0.0", governedReasoningRuntime: mapped, governance: { ...GOVERNED_REASONING_RUNTIME_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapGovernedReasoningRuntime(raw: unknown): GovernedReasoningRuntime | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedReasoningRuntimeId !== "string" || !String(r.governedReasoningRuntimeId).trim()) return null;
  if (!Array.isArray(r.runtimeSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.runtimeSlots.map(mapSlot).filter((s): s is GovernedReasoningRuntimeSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { governedReasoningRuntimeId: String(r.governedReasoningRuntimeId).trim(), providerId, runtimeSlots: slots, governance: { ...GOVERNED_REASONING_RUNTIME_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      reasoningExecutionContextId: String(meta.reasoningExecutionContextId ?? ""),
      governedReasoningPreparationId: String(meta.governedReasoningPreparationId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): GovernedReasoningRuntimeSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_runtime_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_runtime_slot", status: slot.status, slotKey: slot.slotKey };
}
