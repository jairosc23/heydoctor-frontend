import {
  GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE,
  type GovernedClinicalSessionPackage,
  type GovernedClinicalSessionPackageBuilderResult,
  type GovernedClinicalSessionPackageSlot,
  type AiLayerProviderId,
} from "./governed-clinical-session-package";

export function mapGovernedClinicalSessionPackageEnvelope(payload: unknown): GovernedClinicalSessionPackageBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_clinical_session_package"
      ? root
      : root.sessionPackage && typeof root.sessionPackage === "object" &&
          (root.sessionPackage as { source?: string }).source === "governed_clinical_session_package"
        ? (root.sessionPackage as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedClinicalSessionPackage(resultObj.sessionPackage);
  if (!mapped) return null;
  return {
    source: "governed_clinical_session_package",
    builderVersion: "1.0.0",
    sessionPackage: mapped,
    governance: { ...GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedClinicalSessionPackage(raw: unknown): GovernedClinicalSessionPackage | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.sessionPackageId !== "string" || !String(r.sessionPackageId).trim()) return null;
  if (!Array.isArray(r.packageSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.packageSlots.map(mapSlot).filter((s): s is GovernedClinicalSessionPackageSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    sessionPackageId: String(r.sessionPackageId).trim(),
    providerId,
    packageSlots: slots,
    governance: { ...GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      contextId: String(meta.contextId ?? ""),
      clinicalPlanId: String(meta.clinicalPlanId ?? ""),
      findingRefId: String(meta.findingRefId ?? ""),
      insightRefId: String(meta.insightRefId ?? ""),
      recommendationRefId: String(meta.recommendationRefId ?? ""),
      reviewId: String(meta.reviewId ?? ""),
      caseId: String(meta.caseId ?? ""),
      responseId: String(meta.responseId ?? ""),
      differentialId: String(meta.differentialId ?? ""),
      evidenceMappingId: String(meta.evidenceMappingId ?? ""),
      confidenceId: String(meta.confidenceId ?? ""),
      missingInformationId: String(meta.missingInformationId ?? ""),
      priorityWorkspaceId: String(meta.priorityWorkspaceId ?? ""),
      workspaceId: String(meta.workspaceId ?? ""),
      evidenceWorkspaceId: String(meta.evidenceWorkspaceId ?? ""),
      gapAnalyzerId: String(meta.gapAnalyzerId ?? ""),
      reviewWorkspaceV2Id: String(meta.reviewWorkspaceV2Id ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedClinicalSessionPackageSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "session_package_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "session_package_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
