import { GOVERNED_REASONING_PREPARATION_GOVERNANCE, type GovernedReasoningPreparation, type GovernedReasoningPreparationBuilderResult, type GovernedReasoningPreparationSlot, type AiLayerProviderId } from "./governed-reasoning-preparation";
export function mapGovernedReasoningPreparationEnvelope(payload: unknown): GovernedReasoningPreparationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "governed_reasoning_preparation" ? root : root.governedReasoningPreparation && typeof root.governedReasoningPreparation === "object" && (root.governedReasoningPreparation as { source?: string }).source === "governed_reasoning_preparation" ? (root.governedReasoningPreparation as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapGovernedReasoningPreparation(resultObj.governedReasoningPreparation);
  if (!mapped) return null;
  return { source: "governed_reasoning_preparation", builderVersion: "1.0.0", governedReasoningPreparation: mapped, governance: { ...GOVERNED_REASONING_PREPARATION_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapGovernedReasoningPreparation(raw: unknown): GovernedReasoningPreparation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedReasoningPreparationId !== "string" || !String(r.governedReasoningPreparationId).trim()) return null;
  if (!Array.isArray(r.preparationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.preparationSlots.map(mapSlot).filter((s): s is GovernedReasoningPreparationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { governedReasoningPreparationId: String(r.governedReasoningPreparationId).trim(), providerId, preparationSlots: slots, governance: { ...GOVERNED_REASONING_PREPARATION_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningInputsId: String(meta.clinicalReasoningInputsId ?? ""),
      governedReasoningWorkspaceId: String(meta.governedReasoningWorkspaceId ?? ""),
      physicianReasoningPreparationId: String(meta.physicianReasoningPreparationId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): GovernedReasoningPreparationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "governed_reasoning_prep_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "governed_reasoning_prep_slot", status: slot.status, slotKey: slot.slotKey };
}
