import { CLINICAL_REASONING_INPUTS_GOVERNANCE, type ClinicalReasoningInputs, type ClinicalReasoningInputsBuilderResult, type ClinicalReasoningInputsSlot, type AiLayerProviderId } from "./clinical-reasoning-inputs";
export function mapClinicalReasoningInputsEnvelope(payload: unknown): ClinicalReasoningInputsBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "clinical_reasoning_inputs" ? root : root.clinicalReasoningInputs && typeof root.clinicalReasoningInputs === "object" && (root.clinicalReasoningInputs as { source?: string }).source === "clinical_reasoning_inputs" ? (root.clinicalReasoningInputs as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapClinicalReasoningInputs(resultObj.clinicalReasoningInputs);
  if (!mapped) return null;
  return { source: "clinical_reasoning_inputs", builderVersion: "1.0.0", clinicalReasoningInputs: mapped, governance: { ...CLINICAL_REASONING_INPUTS_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapClinicalReasoningInputs(raw: unknown): ClinicalReasoningInputs | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalReasoningInputsId !== "string" || !String(r.clinicalReasoningInputsId).trim()) return null;
  if (!Array.isArray(r.inputSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.inputSlots.map(mapSlot).filter((s): s is ClinicalReasoningInputsSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { clinicalReasoningInputsId: String(r.clinicalReasoningInputsId).trim(), providerId, inputSlots: slots, governance: { ...CLINICAL_REASONING_INPUTS_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      evidenceGraphWorkspaceId: String(meta.evidenceGraphWorkspaceId ?? ""),
      clinicalPatternWorkspaceId: String(meta.clinicalPatternWorkspaceId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): ClinicalReasoningInputsSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_input_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "reasoning_input_slot", status: slot.status, slotKey: slot.slotKey };
}
