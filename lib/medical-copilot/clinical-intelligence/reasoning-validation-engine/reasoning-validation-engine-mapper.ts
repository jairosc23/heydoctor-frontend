import { REASONING_VALIDATION_ENGINE_GOVERNANCE, type ReasoningValidationEngine, type ReasoningValidationEngineBuilderResult, type ReasoningValidationEngineSlot, type AiLayerProviderId } from "./reasoning-validation-engine";
export function mapReasoningValidationEngineEnvelope(payload: unknown): ReasoningValidationEngineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "reasoning_validation_engine" ? root : root.reasoningValidationEngine && typeof root.reasoningValidationEngine === "object" && (root.reasoningValidationEngine as { source?: string }).source === "reasoning_validation_engine" ? (root.reasoningValidationEngine as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapReasoningValidationEngine(resultObj.reasoningValidationEngine);
  if (!mapped) return null;
  return { source: "reasoning_validation_engine", builderVersion: "1.0.0", reasoningValidationEngine: mapped, governance: { ...REASONING_VALIDATION_ENGINE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapReasoningValidationEngine(raw: unknown): ReasoningValidationEngine | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reasoningValidationEngineId !== "string" || !String(r.reasoningValidationEngineId).trim()) return null;
  if (!Array.isArray(r.validationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.validationSlots.map(mapSlot).filter((s): s is ReasoningValidationEngineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { reasoningValidationEngineId: String(r.reasoningValidationEngineId).trim(), providerId, validationSlots: slots, governance: { ...REASONING_VALIDATION_ENGINE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      reasoningStateMachineId: String(meta.reasoningStateMachineId ?? ""),
      clinicalReasoningInputPackageId: String(meta.clinicalReasoningInputPackageId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ReasoningValidationEngineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "validation_engine_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "validation_engine_slot", status: slot.status, slotKey: slot.slotKey };
}
