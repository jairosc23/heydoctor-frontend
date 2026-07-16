import {
  MISSING_INFORMATION_GOVERNANCE,
  type MissingInformationEngineResult,
  type MissingInformationEngineResultBuilderResult,
  type MissingInformationEngineResultSlot,
  type AiLayerProviderId,
} from "./missing-information-engine";

export function mapMissingInformationEngineResultEnvelope(payload: unknown): MissingInformationEngineResultBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "missing_information_engine"
      ? root
      : root.missingInformation && typeof root.missingInformation === "object" &&
          (root.missingInformation as { source?: string }).source === "missing_information_engine"
        ? (root.missingInformation as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapMissingInformationEngineResult(resultObj.missingInformation);
  if (!mapped) return null;
  return {
    source: "missing_information_engine",
    builderVersion: "1.0.0",
    missingInformation: mapped,
    governance: { ...MISSING_INFORMATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapMissingInformationEngineResult(raw: unknown): MissingInformationEngineResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.missingInformationId !== "string" || !String(r.missingInformationId).trim()) return null;
  if (!Array.isArray(r.missingSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.missingSlots.map(mapSlot).filter((s): s is MissingInformationEngineResultSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    missingInformationId: String(r.missingInformationId).trim(),
    providerId,
    missingSlots: slots,
    governance: { ...MISSING_INFORMATION_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      differentialId: String(meta.differentialId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): MissingInformationEngineResultSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "missing_information_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "missing_information_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
