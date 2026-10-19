import {
  GOVERNED_CLINICAL_INTELLIGENCE_FLOW_GOVERNANCE,
  GOVERNED_CLINICAL_INTELLIGENCE_FLOW_VERSION,
  type GovernedClinicalIntelligenceFlowDraftView,
  type GovernedClinicalIntelligenceFlowPackageRefs,
  type GovernedClinicalIntelligenceFlowResult,
  type GovernedClinicalIntelligenceFlowStatus,
} from "./governed-clinical-intelligence-flow";

export function mapGovernedClinicalIntelligenceFlowEnvelope(
  payload: unknown,
): GovernedClinicalIntelligenceFlowResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const flowObj =
    root.source === "governed_clinical_intelligence_flow"
      ? root
      : root.flow &&
          typeof root.flow === "object" &&
          (root.flow as { source?: string }).source ===
            "governed_clinical_intelligence_flow"
        ? (root.flow as Record<string, unknown>)
        : null;
  if (!flowObj) return null;
  return mapGovernedClinicalIntelligenceFlow(flowObj);
}

export function mapGovernedClinicalIntelligenceFlow(
  raw: unknown,
): GovernedClinicalIntelligenceFlowResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.source !== "governed_clinical_intelligence_flow") return null;
  if (typeof r.sessionId !== "string" || !r.sessionId.trim()) return null;
  if (typeof r.consultationId !== "string") return null;
  if (typeof r.patientId !== "string") return null;
  const status = mapStatus(r.status);
  if (!status) return null;

  return {
    source: "governed_clinical_intelligence_flow",
    flowVersion: GOVERNED_CLINICAL_INTELLIGENCE_FLOW_VERSION,
    status,
    sessionId: r.sessionId.trim(),
    consultationId: String(r.consultationId),
    patientId: String(r.patientId),
    governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_FLOW_GOVERNANCE },
    packageRefs: mapPackageRefs(r.packageRefs),
    draft: mapDraft(r.draft),
    reason: typeof r.reason === "string" ? r.reason : null,
    generatedAt:
      typeof r.generatedAt === "string"
        ? r.generatedAt
        : new Date().toISOString(),
  };
}

function mapStatus(value: unknown): GovernedClinicalIntelligenceFlowStatus | null {
  if (
    value === "draft_ready" ||
    value === "structural_only" ||
    value === "blocked_by_safety" ||
    value === "execution_failed"
  ) {
    return value;
  }
  return null;
}

function mapPackageRefs(raw: unknown): GovernedClinicalIntelligenceFlowPackageRefs {
  const r =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const pick = (key: string): string | null =>
    typeof r[key] === "string" && String(r[key]).trim()
      ? String(r[key]).trim()
      : null;
  return {
    foundationId: pick("foundationId"),
    clinicalReasoningPackageId: pick("clinicalReasoningPackageId"),
    contextId: pick("contextId"),
    clinicalPlanId: pick("clinicalPlanId"),
    reviewId: pick("reviewId"),
    providerExecutionId: pick("providerExecutionId"),
    normalizedResponseId: pick("normalizedResponseId"),
    clinicalAiOutputId: pick("clinicalAiOutputId"),
    processedResponseId: pick("processedResponseId"),
  };
}

function mapDraft(raw: unknown): GovernedClinicalIntelligenceFlowDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  return {
    status: typeof d.status === "string" ? d.status : "unknown",
    assistiveOnlyNotice:
      typeof d.assistiveOnlyNotice === "string" ? d.assistiveOnlyNotice : null,
    possibleDiagnoses: asStringArray(d.possibleDiagnoses),
    recommendations: asStringArray(d.recommendations),
    generalEducation: asStringArray(d.generalEducation),
    summary: typeof d.summary === "string" ? d.summary : null,
    suggestedDiagnosis: asStringArray(d.suggestedDiagnosis),
    improvedNotes: typeof d.improvedNotes === "string" ? d.improvedNotes : null,
    citations: Array.isArray(d.citations)
      ? d.citations
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const c = item as Record<string, unknown>;
            if (
              typeof c.evidenceId !== "string" ||
              typeof c.label !== "string" ||
              typeof c.category !== "string"
            ) {
              return null;
            }
            return {
              evidenceId: c.evidenceId,
              label: c.label,
              category: c.category,
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null)
      : [],
    model: typeof d.model === "string" ? d.model : null,
    provider: typeof d.provider === "string" ? d.provider : null,
    aiRunId: typeof d.aiRunId === "string" ? d.aiRunId : null,
    safetyVerdict: typeof d.safetyVerdict === "string" ? d.safetyVerdict : null,
    blockReason: typeof d.blockReason === "string" ? d.blockReason : null,
    llmInvocationStatus:
      typeof d.llmInvocationStatus === "string" ? d.llmInvocationStatus : null,
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
