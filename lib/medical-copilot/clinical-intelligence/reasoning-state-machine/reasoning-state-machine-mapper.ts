import { REASONING_STATE_MACHINE_GOVERNANCE, type ReasoningStateMachine, type ReasoningStateMachineBuilderResult, type ReasoningStateMachineSlot, type AiLayerProviderId } from "./reasoning-state-machine";
export function mapReasoningStateMachineEnvelope(payload: unknown): ReasoningStateMachineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "reasoning_state_machine" ? root : root.reasoningStateMachine && typeof root.reasoningStateMachine === "object" && (root.reasoningStateMachine as { source?: string }).source === "reasoning_state_machine" ? (root.reasoningStateMachine as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapReasoningStateMachine(resultObj.reasoningStateMachine);
  if (!mapped) return null;
  return { source: "reasoning_state_machine", builderVersion: "1.0.0", reasoningStateMachine: mapped, governance: { ...REASONING_STATE_MACHINE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapReasoningStateMachine(raw: unknown): ReasoningStateMachine | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reasoningStateMachineId !== "string" || !String(r.reasoningStateMachineId).trim()) return null;
  if (!Array.isArray(r.stateSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.stateSlots.map(mapSlot).filter((s): s is ReasoningStateMachineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { reasoningStateMachineId: String(r.reasoningStateMachineId).trim(), providerId, stateSlots: slots, governance: { ...REASONING_STATE_MACHINE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      reasoningStageManagerId: String(meta.reasoningStageManagerId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ReasoningStateMachineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "state_machine_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "state_machine_slot", status: slot.status, slotKey: slot.slotKey };
}
