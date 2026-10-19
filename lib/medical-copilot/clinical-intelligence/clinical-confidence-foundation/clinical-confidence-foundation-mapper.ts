import {
  CLINICAL_CONFIDENCE_GOVERNANCE,
  type ClinicalConfidenceFoundation,
  type ClinicalConfidenceFoundationBuilderResult,
  type ClinicalConfidenceFoundationSlot,
  type AiLayerProviderId,
} from "./clinical-confidence-foundation";

export function mapClinicalConfidenceFoundationEnvelope(payload: unknown): ClinicalConfidenceFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_confidence_foundation"
      ? root
      : root.confidence && typeof root.confidence === "object" &&
          (root.confidence as { source?: string }).source === "clinical_confidence_foundation"
        ? (root.confidence as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalConfidenceFoundation(resultObj.confidence);
  if (!mapped) return null;
  return {
    source: "clinical_confidence_foundation",
    builderVersion: "1.0.0",
    confidence: mapped,
    governance: { ...CLINICAL_CONFIDENCE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalConfidenceFoundation(raw: unknown): ClinicalConfidenceFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.confidenceId !== "string" || !String(r.confidenceId).trim()) return null;
  if (!Array.isArray(r.confidenceSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.confidenceSlots.map(mapSlot).filter((s): s is ClinicalConfidenceFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    confidenceId: String(r.confidenceId).trim(),
    providerId,
    confidenceSlots: slots,
    governance: { ...CLINICAL_CONFIDENCE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      differentialId: String(meta.differentialId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      evidenceCoverage: String(meta.evidenceCoverage ?? ""),
      completeness: String(meta.completeness ?? ""),
      missingInformation: String(meta.missingInformation ?? ""),
      structuralConfidence: String(meta.structuralConfidence ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalConfidenceFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "confidence_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "confidence_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
