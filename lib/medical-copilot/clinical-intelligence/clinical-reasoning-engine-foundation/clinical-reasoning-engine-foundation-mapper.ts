import { CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE, type ClinicalReasoningEngineFoundation, type ClinicalReasoningEngineFoundationBuilderResult, type ClinicalReasoningEngineFoundationSlot, type AiLayerProviderId } from "./clinical-reasoning-engine-foundation";
export function mapClinicalReasoningEngineFoundationEnvelope(payload: unknown): ClinicalReasoningEngineFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_engine_foundation" ? root : root.clinicalReasoningEngineFoundation && typeof root.clinicalReasoningEngineFoundation === "object" && (root.clinicalReasoningEngineFoundation as { source?: string }).source === "clinical_reasoning_engine_foundation" ? (root.clinicalReasoningEngineFoundation as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningEngineFoundation(resultObj.clinicalReasoningEngineFoundation);
  if (!mapped) return null;
  return { source: "clinical_reasoning_engine_foundation", builderVersion: "1.0.0", clinicalReasoningEngineFoundation: mapped, governance: { ...CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningEngineFoundation(raw: unknown): ClinicalReasoningEngineFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningEngineFoundationId !== "string" || !String(r.clinicalReasoningEngineFoundationId).trim()) return null;
  if (!Array.isArray(r.foundationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.foundationSlots.map(mapSlot).filter((s): s is ClinicalReasoningEngineFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningEngineFoundationId: String(r.clinicalReasoningEngineFoundationId).trim(), providerId, foundationSlots: slots, governance: { ...CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      governedReasoningRuntimeId: String(meta.governedReasoningRuntimeId ?? ""),
      clinicalReasoningInputPackageId: String(meta.clinicalReasoningInputPackageId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningEngineFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "engine_foundation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "engine_foundation_slot", status: slot.status, slotKey: slot.slotKey };
}
