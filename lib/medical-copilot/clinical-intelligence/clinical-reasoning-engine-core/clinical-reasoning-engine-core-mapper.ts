import { CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE, type ClinicalReasoningEngineCore, type ClinicalReasoningEngineCoreBuilderResult, type ClinicalReasoningEngineCoreSlot, type AiLayerProviderId } from "./clinical-reasoning-engine-core";
export function mapClinicalReasoningEngineCoreEnvelope(payload: unknown): ClinicalReasoningEngineCoreBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_engine_core" ? root : root.clinicalReasoningEngineCore && typeof root.clinicalReasoningEngineCore === "object" && (root.clinicalReasoningEngineCore as { source?: string }).source === "clinical_reasoning_engine_core" ? (root.clinicalReasoningEngineCore as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningEngineCore(resultObj.clinicalReasoningEngineCore);
  if (!mapped) return null;
  return { source: "clinical_reasoning_engine_core", builderVersion: "1.0.0", clinicalReasoningEngineCore: mapped, governance: { ...CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningEngineCore(raw: unknown): ClinicalReasoningEngineCore | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningEngineCoreId !== "string" || !String(r.clinicalReasoningEngineCoreId).trim()) return null;
  if (!Array.isArray(r.engineCoreSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.engineCoreSlots.map(mapSlot).filter((s): s is ClinicalReasoningEngineCoreSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningEngineCoreId: String(r.clinicalReasoningEngineCoreId).trim(), providerId, engineCoreSlots: slots, governance: { ...CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningInputPackageId: String(meta.clinicalReasoningInputPackageId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningEngineCoreSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "engine_core_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "engine_core_slot", status: slot.status, slotKey: slot.slotKey };
}
