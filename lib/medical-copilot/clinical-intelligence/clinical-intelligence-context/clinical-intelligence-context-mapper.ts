import { CLINICAL_INTELLIGENCE_CONTEXT_GOVERNANCE, type ClinicalIntelligenceContext, type ClinicalIntelligenceContextBuilderResult, type ClinicalIntelligenceContextSlot, type AiLayerProviderId } from "./clinical-intelligence-context";
export function mapClinicalIntelligenceContextEnvelope(payload: unknown): ClinicalIntelligenceContextBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_intelligence_context" ? root : root.clinicalIntelligenceContext && typeof root.clinicalIntelligenceContext === "object" && (root.clinicalIntelligenceContext as { source?: string }).source === "clinical_intelligence_context" ? (root.clinicalIntelligenceContext as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalIntelligenceContext(resultObj.clinicalIntelligenceContext);
  if (!mapped) return null;
  return { source: "clinical_intelligence_context", builderVersion: "1.0.0", clinicalIntelligenceContext: mapped, governance: { ...CLINICAL_INTELLIGENCE_CONTEXT_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalIntelligenceContext(raw: unknown): ClinicalIntelligenceContext | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalIntelligenceContextId !== "string" || !String(r.clinicalIntelligenceContextId).trim()) return null;
  if (!Array.isArray(r.contextSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.contextSlots.map(mapSlot).filter((s): s is ClinicalIntelligenceContextSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalIntelligenceContextId: String(r.clinicalIntelligenceContextId).trim(), providerId, contextSlots: slots, governance: { ...CLINICAL_INTELLIGENCE_CONTEXT_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalIntelligenceOrchestratorId: String(meta.clinicalIntelligenceOrchestratorId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalIntelligenceContextSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "ci_context_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "ci_context_slot", status: slot.status, slotKey: slot.slotKey };
}
