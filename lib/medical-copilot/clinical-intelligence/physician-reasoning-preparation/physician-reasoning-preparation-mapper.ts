import {
  PHYSICIAN_REASONING_PREPARATION_GOVERNANCE,
  type PhysicianReasoningPreparation,
  type PhysicianReasoningPreparationBuilderResult,
  type PhysicianReasoningPreparationSlot,
  type AiLayerProviderId,
} from "./physician-reasoning-preparation";

export function mapPhysicianReasoningPreparationEnvelope(payload: unknown): PhysicianReasoningPreparationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "physician_reasoning_preparation"
      ? root
      : root.reasoningPreparation && typeof root.reasoningPreparation === "object" &&
          (root.reasoningPreparation as { source?: string }).source === "physician_reasoning_preparation"
        ? (root.reasoningPreparation as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianReasoningPreparation(resultObj.reasoningPreparation);
  if (!mapped) return null;
  return {
    source: "physician_reasoning_preparation",
    builderVersion: "1.0.0",
    reasoningPreparation: mapped,
    governance: { ...PHYSICIAN_REASONING_PREPARATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapPhysicianReasoningPreparation(raw: unknown): PhysicianReasoningPreparation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.physicianReasoningPreparationId !== "string" || !String(r.physicianReasoningPreparationId).trim()) return null;
  if (!Array.isArray(r.preparationSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.preparationSlots.map(mapSlot).filter((s): s is PhysicianReasoningPreparationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    physicianReasoningPreparationId: String(r.physicianReasoningPreparationId).trim(),
    providerId,
    preparationSlots: slots,
    governance: { ...PHYSICIAN_REASONING_PREPARATION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      clinicalReasoningWorkspaceId: String(meta.clinicalReasoningWorkspaceId ?? ""),
      differentialReviewWorkspaceId: String(meta.differentialReviewWorkspaceId ?? ""),
      evidenceCompletenessWorkspaceId: String(meta.evidenceCompletenessWorkspaceId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): PhysicianReasoningPreparationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "reasoning_preparation_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "reasoning_preparation_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
