import {
  GOVERNED_CLINICAL_DRAFT_GOVERNANCE,
  type GovernedClinicalDraftResult,
  type GovernedClinicalDraftView,
} from "./governed-clinical-draft";

export function mapGovernedClinicalDraftEnvelope(
  payload: unknown,
): GovernedClinicalDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.draft !== undefined ||
    root.assistance !== undefined ||
    root.runtime !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const draft = mapDraft(data.draft);
  if (!draft) return null;

  return {
    assistance: data.assistance ?? null,
    runtime: data.runtime ?? null,
    clinicalOutput: data.clinicalOutput ?? null,
    reviewSession: data.reviewSession ?? null,
    decisionWorkspace: data.decisionWorkspace ?? null,
    draft,
    governance: { ...GOVERNED_CLINICAL_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapDraft(raw: unknown): GovernedClinicalDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  return {
    status: "pending_physician_review",
    draftApproved: false,
    requiresPhysicianReview: true,
    executesAction: false,
    autoPersistedToEmr: false,
    persisted: false,
    readOnly: true,
    available: d.available === true,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}
