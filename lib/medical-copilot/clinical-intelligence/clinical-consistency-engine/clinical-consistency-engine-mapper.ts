import { CLINICAL_CONSISTENCY_ENGINE_GOVERNANCE, type ClinicalConsistencyEngine, type ClinicalConsistencyEngineBuilderResult, type ClinicalConsistencyEngineSlot, type AiLayerProviderId } from "./clinical-consistency-engine";
export function mapClinicalConsistencyEngineEnvelope(payload: unknown): ClinicalConsistencyEngineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_consistency_engine" ? root : root.clinicalConsistencyEngine && typeof root.clinicalConsistencyEngine === "object" && (root.clinicalConsistencyEngine as { source?: string }).source === "clinical_consistency_engine" ? (root.clinicalConsistencyEngine as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalConsistencyEngine(resultObj.clinicalConsistencyEngine);
  if (!mapped) return null;
  return { source: "clinical_consistency_engine", builderVersion: "1.0.0", clinicalConsistencyEngine: mapped, governance: { ...CLINICAL_CONSISTENCY_ENGINE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalConsistencyEngine(raw: unknown): ClinicalConsistencyEngine | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalConsistencyEngineId !== "string" || !String(r.clinicalConsistencyEngineId).trim()) return null;
  if (!Array.isArray(r.consistencySlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.consistencySlots.map(mapSlot).filter((s): s is ClinicalConsistencyEngineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalConsistencyEngineId: String(r.clinicalConsistencyEngineId).trim(), providerId, consistencySlots: slots, governance: { ...CLINICAL_CONSISTENCY_ENGINE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      evidenceReasoningEngineId: String(meta.evidenceReasoningEngineId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalConsistencyEngineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "consistency_engine_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "consistency_engine_slot", status: slot.status, slotKey: slot.slotKey };
}
