import { REASONING_RULE_PIPELINE_GOVERNANCE, type ReasoningRulePipeline, type ReasoningRulePipelineBuilderResult, type ReasoningRulePipelineSlot, type AiLayerProviderId } from "./reasoning-rule-pipeline";
export function mapReasoningRulePipelineEnvelope(payload: unknown): ReasoningRulePipelineBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "reasoning_rule_pipeline" ? root : root.reasoningRulePipeline && typeof root.reasoningRulePipeline === "object" && (root.reasoningRulePipeline as { source?: string }).source === "reasoning_rule_pipeline" ? (root.reasoningRulePipeline as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapReasoningRulePipeline(resultObj.reasoningRulePipeline);
  if (!mapped) return null;
  return { source: "reasoning_rule_pipeline", builderVersion: "1.0.0", reasoningRulePipeline: mapped, governance: { ...REASONING_RULE_PIPELINE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapReasoningRulePipeline(raw: unknown): ReasoningRulePipeline | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reasoningRulePipelineId !== "string" || !String(r.reasoningRulePipelineId).trim()) return null;
  if (!Array.isArray(r.pipelineSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.pipelineSlots.map(mapSlot).filter((s): s is ReasoningRulePipelineSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { reasoningRulePipelineId: String(r.reasoningRulePipelineId).trim(), providerId, pipelineSlots: slots, governance: { ...REASONING_RULE_PIPELINE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningEngineCoreId: String(meta.clinicalReasoningEngineCoreId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ReasoningRulePipelineSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "rule_pipeline_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "rule_pipeline_slot", status: slot.status, slotKey: slot.slotKey };
}
