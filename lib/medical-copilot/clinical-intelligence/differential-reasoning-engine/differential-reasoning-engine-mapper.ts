import { DIFFERENTIAL_REASONING_ENGINE_GOVERNANCE, type DifferentialReasoningEngine, type DifferentialReasoningEngineBuilderResult, type DifferentialReasoningEngineSlot, type AiLayerProviderId } from "./differential-reasoning-engine";
export function mapDifferentialReasoningEngineEnvelope(payload: unknown): DifferentialReasoningEngineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "differential_reasoning_engine" ? root : root.differentialReasoningEngine && typeof root.differentialReasoningEngine === "object" && (root.differentialReasoningEngine as { source?: string }).source === "differential_reasoning_engine" ? (root.differentialReasoningEngine as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapDifferentialReasoningEngine(resultObj.differentialReasoningEngine);
  if (!mapped) return null;
  return { source: "differential_reasoning_engine", builderVersion: "1.0.0", differentialReasoningEngine: mapped, governance: { ...DIFFERENTIAL_REASONING_ENGINE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapDifferentialReasoningEngine(raw: unknown): DifferentialReasoningEngine | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.differentialReasoningEngineId !== "string" || !String(r.differentialReasoningEngineId).trim()) return null;
  if (!Array.isArray(r.differentialSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.differentialSlots.map(mapSlot).filter((s): s is DifferentialReasoningEngineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { differentialReasoningEngineId: String(r.differentialReasoningEngineId).trim(), providerId, differentialSlots: slots, governance: { ...DIFFERENTIAL_REASONING_ENGINE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningOrchestratorId: String(meta.clinicalReasoningOrchestratorId ?? ""),
      differentialId: String(meta.differentialId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): DifferentialReasoningEngineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "differential_reasoning_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "differential_reasoning_slot", status: slot.status, slotKey: slot.slotKey };
}
