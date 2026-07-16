import { CLINICAL_REASONING_GRAPH_GOVERNANCE, type ClinicalReasoningGraph, type ClinicalReasoningGraphBuilderResult, type ClinicalReasoningGraphSlot, type AiLayerProviderId } from "./clinical-reasoning-graph";
export function mapClinicalReasoningGraphEnvelope(payload: unknown): ClinicalReasoningGraphBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_graph" ? root : root.clinicalReasoningGraph && typeof root.clinicalReasoningGraph === "object" && (root.clinicalReasoningGraph as { source?: string }).source === "clinical_reasoning_graph" ? (root.clinicalReasoningGraph as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningGraph(resultObj.clinicalReasoningGraph);
  if (!mapped) return null;
  return { source: "clinical_reasoning_graph", builderVersion: "1.0.0", clinicalReasoningGraph: mapped, governance: { ...CLINICAL_REASONING_GRAPH_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningGraph(raw: unknown): ClinicalReasoningGraph | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningGraphId !== "string" || !String(r.clinicalReasoningGraphId).trim()) return null;
  if (!Array.isArray(r.graphSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.graphSlots.map(mapSlot).filter((s): s is ClinicalReasoningGraphSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningGraphId: String(r.clinicalReasoningGraphId).trim(), providerId, graphSlots: slots, governance: { ...CLINICAL_REASONING_GRAPH_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningPipelineId: String(meta.clinicalReasoningPipelineId ?? ""),
      evidenceGraphWorkspaceId: String(meta.evidenceGraphWorkspaceId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningGraphSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_graph_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_graph_slot", status: slot.status, slotKey: slot.slotKey };
}
