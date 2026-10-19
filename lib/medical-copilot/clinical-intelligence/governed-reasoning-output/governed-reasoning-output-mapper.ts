import { GOVERNED_REASONING_OUTPUT_GOVERNANCE, type GovernedReasoningOutput, type GovernedReasoningOutputBuilderResult, type GovernedReasoningOutputSlot, type AiLayerProviderId } from "./governed-reasoning-output";
export function mapGovernedReasoningOutputEnvelope(payload: unknown): GovernedReasoningOutputBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "governed_reasoning_output" ? root : root.governedReasoningOutput && typeof root.governedReasoningOutput === "object" && (root.governedReasoningOutput as { source?: string }).source === "governed_reasoning_output" ? (root.governedReasoningOutput as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapGovernedReasoningOutput(resultObj.governedReasoningOutput);
  if (!mapped) return null;
  return { source: "governed_reasoning_output", builderVersion: "1.0.0", governedReasoningOutput: mapped, governance: { ...GOVERNED_REASONING_OUTPUT_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapGovernedReasoningOutput(raw: unknown): GovernedReasoningOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedReasoningOutputId !== "string" || !String(r.governedReasoningOutputId).trim()) return null;
  if (!Array.isArray(r.outputSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.outputSlots.map(mapSlot).filter((s): s is GovernedReasoningOutputSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { governedReasoningOutputId: String(r.governedReasoningOutputId).trim(), providerId, outputSlots: slots, governance: { ...GOVERNED_REASONING_OUTPUT_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalConsistencyEngineId: String(meta.clinicalConsistencyEngineId ?? ""),
      clinicalReasoningTraceId: String(meta.clinicalReasoningTraceId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): GovernedReasoningOutputSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_output_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_output_slot", status: slot.status, slotKey: slot.slotKey };
}
