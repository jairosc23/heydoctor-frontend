import {
  DIFFERENTIAL_FOUNDATION_GOVERNANCE,
  type ClinicalDifferentialFoundation,
  type ClinicalDifferentialFoundationBuilderResult,
  type ClinicalDifferentialFoundationSlot,
  type AiLayerProviderId,
} from "./clinical-differential-foundation";

export function mapClinicalDifferentialFoundationEnvelope(payload: unknown): ClinicalDifferentialFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_differential_foundation"
      ? root
      : root.differential && typeof root.differential === "object" &&
          (root.differential as { source?: string }).source === "clinical_differential_foundation"
        ? (root.differential as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalDifferentialFoundation(resultObj.differential);
  if (!mapped) return null;
  return {
    source: "clinical_differential_foundation",
    builderVersion: "1.0.0",
    differential: mapped,
    governance: { ...DIFFERENTIAL_FOUNDATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalDifferentialFoundation(raw: unknown): ClinicalDifferentialFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.differentialId !== "string" || !String(r.differentialId).trim()) return null;
  if (!Array.isArray(r.differentialSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.differentialSlots.map(mapSlot).filter((s): s is ClinicalDifferentialFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    differentialId: String(r.differentialId).trim(),
    providerId,
    differentialSlots: slots,
    governance: { ...DIFFERENTIAL_FOUNDATION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
      responseId: String(meta.responseId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalDifferentialFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "differential_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "differential_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
