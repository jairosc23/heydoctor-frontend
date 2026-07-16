import { CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE, type ClinicalIntelligenceRuntime, type ClinicalIntelligenceRuntimeBuilderResult, type ClinicalIntelligenceRuntimeSlot, type AiLayerProviderId } from "./clinical-intelligence-runtime";
export function mapClinicalIntelligenceRuntimeEnvelope(payload: unknown): ClinicalIntelligenceRuntimeBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_intelligence_runtime" ? root : root.clinicalIntelligenceRuntime && typeof root.clinicalIntelligenceRuntime === "object" && (root.clinicalIntelligenceRuntime as { source?: string }).source === "clinical_intelligence_runtime" ? (root.clinicalIntelligenceRuntime as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalIntelligenceRuntime(resultObj.clinicalIntelligenceRuntime);
  if (!mapped) return null;
  return { source: "clinical_intelligence_runtime", builderVersion: "1.0.0", clinicalIntelligenceRuntime: mapped, governance: { ...CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalIntelligenceRuntime(raw: unknown): ClinicalIntelligenceRuntime | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalIntelligenceRuntimeId !== "string" || !String(r.clinicalIntelligenceRuntimeId).trim()) return null;
  if (!Array.isArray(r.runtimeSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.runtimeSlots.map(mapSlot).filter((s): s is ClinicalIntelligenceRuntimeSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalIntelligenceRuntimeId: String(r.clinicalIntelligenceRuntimeId).trim(), providerId, runtimeSlots: slots, governance: { ...CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalIntelligenceTraceId: String(meta.clinicalIntelligenceTraceId ?? ""),
      clinicalReasoningRuntimeFoundationId: String(meta.clinicalReasoningRuntimeFoundationId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalIntelligenceRuntimeSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "ci_runtime_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "ci_runtime_slot", status: slot.status, slotKey: slot.slotKey };
}
