import {
  EVIDENCE_MAPPING_GOVERNANCE,
  type EvidenceMappingFoundation,
  type EvidenceMappingFoundationBuilderResult,
  type EvidenceMappingFoundationSlot,
  type AiLayerProviderId,
} from "./evidence-mapping-foundation";

export function mapEvidenceMappingFoundationEnvelope(payload: unknown): EvidenceMappingFoundationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "evidence_mapping_foundation"
      ? root
      : root.evidenceMapping && typeof root.evidenceMapping === "object" &&
          (root.evidenceMapping as { source?: string }).source === "evidence_mapping_foundation"
        ? (root.evidenceMapping as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapEvidenceMappingFoundation(resultObj.evidenceMapping);
  if (!mapped) return null;
  return {
    source: "evidence_mapping_foundation",
    builderVersion: "1.0.0",
    evidenceMapping: mapped,
    governance: { ...EVIDENCE_MAPPING_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapEvidenceMappingFoundation(raw: unknown): EvidenceMappingFoundation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.evidenceMappingId !== "string" || !String(r.evidenceMappingId).trim()) return null;
  if (!Array.isArray(r.mappingSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.mappingSlots.map(mapSlot).filter((s): s is EvidenceMappingFoundationSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    evidenceMappingId: String(r.evidenceMappingId).trim(),
    providerId,
    mappingSlots: slots,
    governance: { ...EVIDENCE_MAPPING_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      differentialId: String(meta.differentialId ?? ""),
      findingRefId: String(meta.findingRefId ?? ""),
      insightRefId: String(meta.insightRefId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): EvidenceMappingFoundationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "evidence_mapping_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "evidence_mapping_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
