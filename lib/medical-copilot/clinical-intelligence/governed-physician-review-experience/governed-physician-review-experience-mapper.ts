import {
  PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE,
  type GovernedPhysicianReviewExperience,
  type GovernedPhysicianReviewExperienceBuilderResult,
  type GovernedPhysicianReviewExperienceSlot,
  type AiLayerProviderId,
} from "./governed-physician-review-experience";

export function mapGovernedPhysicianReviewExperienceEnvelope(payload: unknown): GovernedPhysicianReviewExperienceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_physician_review_experience"
      ? root
      : root.reviewExperience && typeof root.reviewExperience === "object" &&
          (root.reviewExperience as { source?: string }).source === "governed_physician_review_experience"
        ? (root.reviewExperience as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedPhysicianReviewExperience(resultObj.reviewExperience);
  if (!mapped) return null;
  return {
    source: "governed_physician_review_experience",
    builderVersion: "1.0.0",
    reviewExperience: mapped,
    governance: { ...PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedPhysicianReviewExperience(raw: unknown): GovernedPhysicianReviewExperience | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.reviewExperienceId !== "string" || !String(r.reviewExperienceId).trim()) return null;
  if (!Array.isArray(r.experienceSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.experienceSlots.map(mapSlot).filter((s): s is GovernedPhysicianReviewExperienceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    reviewExperienceId: String(r.reviewExperienceId).trim(),
    providerId,
    experienceSlots: slots,
    governance: { ...PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      executionId: String(meta.executionId ?? ""),
      responseId: String(meta.responseId ?? ""),
      promptId: String(meta.promptId ?? ""),
      templateId: String(meta.templateId ?? ""),
      composedPromptId: String(meta.composedPromptId ?? ""),
      assemblyId: String(meta.assemblyId ?? ""),
      translationId: String(meta.translationId ?? ""),
      providerExecutionId: String(meta.providerExecutionId ?? ""),
      processedId: String(meta.processedId ?? ""),
      decisionState: String(meta.decisionState ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedPhysicianReviewExperienceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "experience_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "experience_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
