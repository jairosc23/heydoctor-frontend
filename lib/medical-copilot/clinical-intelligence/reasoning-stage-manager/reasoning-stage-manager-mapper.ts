import { REASONING_STAGE_MANAGER_GOVERNANCE, type ReasoningStageManager, type ReasoningStageManagerBuilderResult, type ReasoningStageManagerSlot, type AiLayerProviderId } from "./reasoning-stage-manager";
export function mapReasoningStageManagerEnvelope(payload: unknown): ReasoningStageManagerBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "reasoning_stage_manager" ? root : root.reasoningStageManager && typeof root.reasoningStageManager === "object" && (root.reasoningStageManager as { source?: string }).source === "reasoning_stage_manager" ? (root.reasoningStageManager as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapReasoningStageManager(resultObj.reasoningStageManager);
  if (!mapped) return null;
  return { source: "reasoning_stage_manager", builderVersion: "1.0.0", reasoningStageManager: mapped, governance: { ...REASONING_STAGE_MANAGER_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapReasoningStageManager(raw: unknown): ReasoningStageManager | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reasoningStageManagerId !== "string" || !String(r.reasoningStageManagerId).trim()) return null;
  if (!Array.isArray(r.stageSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.stageSlots.map(mapSlot).filter((s): s is ReasoningStageManagerSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { reasoningStageManagerId: String(r.reasoningStageManagerId).trim(), providerId, stageSlots: slots, governance: { ...REASONING_STAGE_MANAGER_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningEngineFoundationId: String(meta.clinicalReasoningEngineFoundationId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ReasoningStageManagerSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "stage_manager_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "stage_manager_slot", status: slot.status, slotKey: slot.slotKey };
}
