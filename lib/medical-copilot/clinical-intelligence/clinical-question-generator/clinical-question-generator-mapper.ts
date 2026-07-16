import {
  CLINICAL_QUESTION_GENERATOR_GOVERNANCE,
  type ClinicalQuestionGeneratorResult,
  type ClinicalQuestionGeneratorResultBuilderResult,
  type ClinicalQuestionGeneratorResultSlot,
  type AiLayerProviderId,
} from "./clinical-question-generator";

export function mapClinicalQuestionGeneratorResultEnvelope(payload: unknown): ClinicalQuestionGeneratorResultBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "clinical_question_generator"
      ? root
      : root.clinicalQuestions && typeof root.clinicalQuestions === "object" &&
          (root.clinicalQuestions as { source?: string }).source === "clinical_question_generator"
        ? (root.clinicalQuestions as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapClinicalQuestionGeneratorResult(resultObj.clinicalQuestions);
  if (!mapped) return null;
  return {
    source: "clinical_question_generator",
    builderVersion: "1.0.0",
    clinicalQuestions: mapped,
    governance: { ...CLINICAL_QUESTION_GENERATOR_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapClinicalQuestionGeneratorResult(raw: unknown): ClinicalQuestionGeneratorResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.clinicalQuestionsId !== "string" || !String(r.clinicalQuestionsId).trim()) return null;
  if (!Array.isArray(r.questionSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.questionSlots.map(mapSlot).filter((s): s is ClinicalQuestionGeneratorResultSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    clinicalQuestionsId: String(r.clinicalQuestionsId).trim(),
    providerId,
    questionSlots: slots,
    governance: { ...CLINICAL_QUESTION_GENERATOR_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      reviewSessionId: String(meta.reviewSessionId ?? ""),
      contextId: String(meta.contextId ?? ""),
      missingInformationId: String(meta.missingInformationId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): ClinicalQuestionGeneratorResultSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "clinical_question_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "clinical_question_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
