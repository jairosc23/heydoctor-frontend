import {
  DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE,
  type DiagnosticGapAnalyzerResult,
  type DiagnosticGapAnalyzerResultBuilderResult,
  type DiagnosticGapAnalyzerResultSlot,
  type AiLayerProviderId,
} from "./diagnostic-gap-analyzer";

export function mapDiagnosticGapAnalyzerResultEnvelope(payload: unknown): DiagnosticGapAnalyzerResultBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "diagnostic_gap_analyzer"
      ? root
      : root.gapAnalyzer && typeof root.gapAnalyzer === "object" &&
          (root.gapAnalyzer as { source?: string }).source === "diagnostic_gap_analyzer"
        ? (root.gapAnalyzer as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapDiagnosticGapAnalyzerResult(resultObj.gapAnalyzer);
  if (!mapped) return null;
  return {
    source: "diagnostic_gap_analyzer",
    builderVersion: "1.0.0",
    gapAnalyzer: mapped,
    governance: { ...DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapDiagnosticGapAnalyzerResult(raw: unknown): DiagnosticGapAnalyzerResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.gapAnalyzerId !== "string" || !String(r.gapAnalyzerId).trim()) return null;
  if (!Array.isArray(r.gapSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.gapSlots.map(mapSlot).filter((s): s is DiagnosticGapAnalyzerResultSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    gapAnalyzerId: String(r.gapAnalyzerId).trim(),
    providerId,
    gapSlots: slots,
    governance: { ...DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      evidenceWorkspaceId: String(meta.evidenceWorkspaceId ?? ""),
      missingInformationId: String(meta.missingInformationId ?? ""),
      contextId: String(meta.contextId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): DiagnosticGapAnalyzerResultSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "diagnostic_gap_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "diagnostic_gap_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
