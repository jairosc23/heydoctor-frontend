import {
  CLINICAL_PATTERN_WORKSPACE_GOVERNANCE,
  type ClinicalPatternWorkspace,
  type ClinicalPatternWorkspaceBuilderResult,
  type ClinicalPatternWorkspaceSlot,
  type AiLayerProviderId,
} from "./clinical-pattern-workspace";

export function mapClinicalPatternWorkspaceEnvelope(payload: unknown): ClinicalPatternWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_pattern_workspace"
      ? root
      : root.clinicalPatternWorkspace && typeof root.clinicalPatternWorkspace === "object" &&
          (root.clinicalPatternWorkspace as { source?: string }).source === "clinical_pattern_workspace"
        ? (root.clinicalPatternWorkspace as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalPatternWorkspace(resultObj.clinicalPatternWorkspace);
  if (!mapped) return null;
  return {
    source: "clinical_pattern_workspace",
    builderVersion: "1.0.0",
    clinicalPatternWorkspace: mapped,
    governance: { ...CLINICAL_PATTERN_WORKSPACE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalPatternWorkspace(raw: unknown): ClinicalPatternWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalPatternWorkspaceId !== "string" || !String(r.clinicalPatternWorkspaceId).trim()) return null;
  if (!Array.isArray(r.patternSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.patternSlots.map(mapSlot).filter((s): s is ClinicalPatternWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    clinicalPatternWorkspaceId: String(r.clinicalPatternWorkspaceId).trim(),
    providerId,
    patternSlots: slots,
    governance: { ...CLINICAL_PATTERN_WORKSPACE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      evidenceCorrelationWorkspaceId: String(meta.evidenceCorrelationWorkspaceId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalPatternWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "clinical_pattern_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "clinical_pattern_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
