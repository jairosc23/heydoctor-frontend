import { CLINICAL_REASONING_PIPELINE_GOVERNANCE, type ClinicalReasoningPipeline, type ClinicalReasoningPipelineBuilderResult, type ClinicalReasoningPipelineSlot, type AiLayerProviderId } from "./clinical-reasoning-pipeline";
export function mapClinicalReasoningPipelineEnvelope(payload: unknown): ClinicalReasoningPipelineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_pipeline" ? root : root.clinicalReasoningPipeline && typeof root.clinicalReasoningPipeline === "object" && (root.clinicalReasoningPipeline as { source?: string }).source === "clinical_reasoning_pipeline" ? (root.clinicalReasoningPipeline as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningPipeline(resultObj.clinicalReasoningPipeline);
  if (!mapped) return null;
  return { source: "clinical_reasoning_pipeline", builderVersion: "1.0.0", clinicalReasoningPipeline: mapped, governance: { ...CLINICAL_REASONING_PIPELINE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningPipeline(raw: unknown): ClinicalReasoningPipeline | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningPipelineId !== "string" || !String(r.clinicalReasoningPipelineId).trim()) return null;
  if (!Array.isArray(r.pipelineSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.pipelineSlots.map(mapSlot).filter((s): s is ClinicalReasoningPipelineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningPipelineId: String(r.clinicalReasoningPipelineId).trim(), providerId, pipelineSlots: slots, governance: { ...CLINICAL_REASONING_PIPELINE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningRuntimeFoundationId: String(meta.clinicalReasoningRuntimeFoundationId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningPipelineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_pipeline_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_pipeline_slot", status: slot.status, slotKey: slot.slotKey };
}
