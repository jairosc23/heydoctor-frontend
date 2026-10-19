import { CLINICAL_INTELLIGENCE_GRAPH_GOVERNANCE, type ClinicalIntelligenceGraph, type ClinicalIntelligenceGraphBuilderResult, type ClinicalIntelligenceGraphSlot, type AiLayerProviderId } from "./clinical-intelligence-graph";
export function mapClinicalIntelligenceGraphEnvelope(payload: unknown): ClinicalIntelligenceGraphBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_intelligence_graph" ? root : root.clinicalIntelligenceGraph && typeof root.clinicalIntelligenceGraph === "object" && (root.clinicalIntelligenceGraph as { source?: string }).source === "clinical_intelligence_graph" ? (root.clinicalIntelligenceGraph as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalIntelligenceGraph(resultObj.clinicalIntelligenceGraph);
  if (!mapped) return null;
  return { source: "clinical_intelligence_graph", builderVersion: "1.0.0", clinicalIntelligenceGraph: mapped, governance: { ...CLINICAL_INTELLIGENCE_GRAPH_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalIntelligenceGraph(raw: unknown): ClinicalIntelligenceGraph | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalIntelligenceGraphId !== "string" || !String(r.clinicalIntelligenceGraphId).trim()) return null;
  if (!Array.isArray(r.graphSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.graphSlots.map(mapSlot).filter((s): s is ClinicalIntelligenceGraphSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalIntelligenceGraphId: String(r.clinicalIntelligenceGraphId).trim(), providerId, graphSlots: slots, governance: { ...CLINICAL_INTELLIGENCE_GRAPH_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalIntelligenceContextId: String(meta.clinicalIntelligenceContextId ?? ""),
      evidenceReasoningEngineId: String(meta.evidenceReasoningEngineId ?? ""),
      clinicalReasoningGraphId: String(meta.clinicalReasoningGraphId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalIntelligenceGraphSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "ci_graph_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "ci_graph_slot", status: slot.status, slotKey: slot.slotKey };
}
