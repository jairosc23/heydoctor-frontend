import { CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE, type ClinicalReasoningRuntimeFoundation, type ClinicalReasoningRuntimeFoundationBuilderResult, type ClinicalReasoningRuntimeFoundationSlot, type AiLayerProviderId } from "./clinical-reasoning-runtime-foundation";
export function mapClinicalReasoningRuntimeFoundationEnvelope(payload: unknown): ClinicalReasoningRuntimeFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_runtime_foundation" ? root : root.clinicalReasoningRuntimeFoundation && typeof root.clinicalReasoningRuntimeFoundation === "object" && (root.clinicalReasoningRuntimeFoundation as { source?: string }).source === "clinical_reasoning_runtime_foundation" ? (root.clinicalReasoningRuntimeFoundation as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningRuntimeFoundation(resultObj.clinicalReasoningRuntimeFoundation);
  if (!mapped) return null;
  return { source: "clinical_reasoning_runtime_foundation", builderVersion: "1.0.0", clinicalReasoningRuntimeFoundation: mapped, governance: { ...CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningRuntimeFoundation(raw: unknown): ClinicalReasoningRuntimeFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningRuntimeFoundationId !== "string" || !String(r.clinicalReasoningRuntimeFoundationId).trim()) return null;
  if (!Array.isArray(r.runtimeFoundationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.runtimeFoundationSlots.map(mapSlot).filter((s): s is ClinicalReasoningRuntimeFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningRuntimeFoundationId: String(r.clinicalReasoningRuntimeFoundationId).trim(), providerId, runtimeFoundationSlots: slots, governance: { ...CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedReasoningSessionId: String(meta.governedReasoningSessionId ?? ""),
      clinicalReasoningEngineFoundationId: String(meta.clinicalReasoningEngineFoundationId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningRuntimeFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "runtime_foundation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "runtime_foundation_slot", status: slot.status, slotKey: slot.slotKey };
}
