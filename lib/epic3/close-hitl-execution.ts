/**
 * EPIC-3 UC-04D — Close HITL execution (H2 → H3 → H4).
 *
 * Uses Persistence Preview candidate (accepted/edited only) with the existing
 * Governed SOAP Persistence Execution writer + consultation sign.
 * No new AI generation. No parallel writers.
 */

import {
  approveMedicalCopilotAction,
  getMedicalCopilotActions,
  postMedicalCopilotGovernedSoapPersistenceExecution,
} from "@/lib/medical-copilot/api";
import { signConsultation } from "@/lib/services/consultations";
import { EPIC3_HITL_ACTS } from "./architecture-contract";
import type {
  PersistencePreviewCandidateItem,
  PersistencePreviewPayload,
} from "./persistence-preview";
import { itemReadyForPersistence } from "./review-selection";

export type CloseSoapPatch = {
  notes: string;
};

export type CloseHitlAuditTrail = {
  sessionId: string | null;
  consultationId: string | null;
  previewId: string | null;
  h2Status: "not_executed" | "approved" | "failed";
  h3Status: "not_executed" | "executed" | "failed" | "blocked";
  h4Status: "not_executed" | "signed" | "failed";
  approvedActionIds: string[];
  candidateItemIds: string[];
  excludedDecisions: Array<"discarded" | "pending">;
  persistenceId: string | null;
  correlationId: string | null;
  writeExecuted: boolean;
  rollbackExecuted: boolean;
  aiRunIds: string[];
  reason: string | null;
  updatedAt: string;
};

export type CloseHitlGateResult = {
  ok: boolean;
  reason: string | null;
  candidateCount: number;
  pendingCount: number;
  discardedCount: number;
};

const CLOSE_NOTES_MARKER = "--- Clinical Copilot Close (EPIC-3) ---";

export function validatePreviewForPersistence(
  preview: PersistencePreviewPayload,
): CloseHitlGateResult {
  const pendingCount = preview.summary.pending;
  const discardedCount = preview.summary.discarded;
  const candidateCount = preview.persistenceCandidate.itemCount;
  const illegal = preview.persistenceCandidate.items.filter(
    (i) => i.decision !== "accepted" && i.decision !== "edited",
  );
  if (illegal.length > 0) {
    return {
      ok: false,
      reason: "candidate_contains_non_selected_blocks",
      candidateCount,
      pendingCount,
      discardedCount,
    };
  }
  if (pendingCount > 0) {
    return {
      ok: false,
      reason: "pending_blocks_must_be_resolved",
      candidateCount,
      pendingCount,
      discardedCount,
    };
  }
  const missingH1 = preview.blocks.filter((b) => {
    if (b.decision !== "accepted" && b.decision !== "edited") return false;
    return !itemReadyForPersistence({
      id: b.id,
      kind: b.kind,
      sourceUc: b.sourceUc,
      sectionId: b.sectionId,
      label: b.label,
      sourceText: b.sourceText,
      displayText: b.text,
      decision: b.decision,
      aiRunId: b.aiRunId,
      promptVersion: b.promptVersion,
      h1Status: b.h1Status,
    });
  });
  if (missingH1.length > 0) {
    return {
      ok: false,
      reason: "h1_approve_required_for_generative_blocks",
      candidateCount,
      pendingCount,
      discardedCount,
    };
  }
  if (candidateCount === 0) {
    return {
      ok: false,
      reason: "no_accepted_or_edited_blocks",
      candidateCount,
      pendingCount,
      discardedCount,
    };
  }
  return {
    ok: true,
    reason: null,
    candidateCount,
    pendingCount,
    discardedCount,
  };
}

function formatCandidateLine(item: PersistencePreviewCandidateItem): string {
  const run = item.aiRunId ? ` aiRunId=${item.aiRunId}` : "";
  const ver = item.promptVersion ? ` promptVersion=${item.promptVersion}` : "";
  return `[${item.decision}/${item.sourceUc}/${item.kind}] ${item.text}${run}${ver}`;
}

/**
 * Maps UC-04C candidate → SOAP notes patch only.
 * Never writes diagnosis/treatment/Rx/orders from Copilot suggestions.
 */
export function mapPreviewCandidateToSoapPatch(
  preview: PersistencePreviewPayload,
  existingNotes: string | null | undefined,
): CloseSoapPatch {
  const gate = validatePreviewForPersistence(preview);
  if (!gate.ok) {
    throw new Error(gate.reason ?? "preview_not_ready");
  }
  const lines = preview.persistenceCandidate.items.map(formatCandidateLine);
  const block = [CLOSE_NOTES_MARKER, ...lines].join("\n");
  const prior = (existingNotes ?? "").trim();
  const withoutPriorClose = prior.includes(CLOSE_NOTES_MARKER)
    ? prior.slice(0, prior.indexOf(CLOSE_NOTES_MARKER)).trim()
    : prior;
  const notes = withoutPriorClose
    ? `${withoutPriorClose}\n\n${block}`
    : block;
  return { notes };
}

export function buildInitialCloseHitlAudit(
  preview: PersistencePreviewPayload,
): CloseHitlAuditTrail {
  return {
    sessionId: preview.sessionId,
    consultationId: preview.consultationId,
    previewId: preview.previewId,
    h2Status: "not_executed",
    h3Status: "not_executed",
    h4Status: "not_executed",
    approvedActionIds: [],
    candidateItemIds: preview.persistenceCandidate.items.map((i) => i.id),
    excludedDecisions: ["discarded", "pending"],
    persistenceId: null,
    correlationId: null,
    writeExecuted: false,
    rollbackExecuted: false,
    aiRunIds: preview.persistenceCandidate.items
      .map((i) => i.aiRunId)
      .filter((id): id is string => Boolean(id)),
    reason: null,
    updatedAt: new Date().toISOString(),
  };
}

function isApprovableAction(status: string | undefined): boolean {
  if (!status) return true;
  const s = status.toLowerCase();
  if (s.includes("approved") || s.includes("rejected") || s.includes("executed")) {
    return false;
  }
  return true;
}

/**
 * H2 — Approve Action: explicit package approval + approve pending MC actions.
 */
export async function runCloseHitlH2Approve(input: {
  preview: PersistencePreviewPayload;
}): Promise<{ audit: CloseHitlAuditTrail; approvedActionIds: string[] }> {
  const gate = validatePreviewForPersistence(input.preview);
  if (!gate.ok) {
    throw new Error(gate.reason ?? "preview_not_ready");
  }
  if (!input.preview.sessionId) {
    throw new Error("missing_session_id");
  }

  const approvedActionIds: string[] = [];
  try {
    const listed = await getMedicalCopilotActions(input.preview.sessionId);
    const actions = listed.data?.actions ?? [];
    for (const action of actions) {
      if (!isApprovableAction(action.status)) continue;
      await approveMedicalCopilotAction(action.actionId);
      approvedActionIds.push(action.actionId);
    }
  } catch {
    /* allow_no_actions / empty session actions still permit persist */
  }

  const audit = buildInitialCloseHitlAudit(input.preview);
  audit.h2Status = "approved";
  audit.approvedActionIds = approvedActionIds;
  audit.reason = "h2_package_approved";
  audit.updatedAt = new Date().toISOString();
  return { audit, approvedActionIds };
}

/**
 * H3 — Execute existing SOAP persistence writer with candidate notes only.
 */
export async function runCloseHitlH3Persist(input: {
  preview: PersistencePreviewPayload;
  expectedVersion: string;
  existingNotes?: string | null;
  priorAudit: CloseHitlAuditTrail;
}): Promise<{ audit: CloseHitlAuditTrail; writeExecuted: boolean }> {
  if (input.priorAudit.h2Status !== "approved") {
    throw new Error("h2_required_before_h3");
  }
  const gate = validatePreviewForPersistence(input.preview);
  if (!gate.ok) {
    throw new Error(gate.reason ?? "preview_not_ready");
  }
  if (!input.preview.sessionId) {
    throw new Error("missing_session_id");
  }
  if (!input.expectedVersion) {
    throw new Error("missing_expected_version");
  }

  const patch = mapPreviewCandidateToSoapPatch(
    input.preview,
    input.existingNotes,
  );

  const envelope = await postMedicalCopilotGovernedSoapPersistenceExecution(
    input.preview.sessionId,
    {
      draftApproved: true,
      expectedVersion: input.expectedVersion,
      patch,
    },
  );

  const data = envelope.data ?? {};
  const writeExecuted = data.writeExecuted === true || data.entityPersisted === true;
  const audit: CloseHitlAuditTrail = {
    ...input.priorAudit,
    h3Status: writeExecuted ? "executed" : "failed",
    writeExecuted,
    rollbackExecuted: data.rollbackExecuted === true,
    persistenceId: data.persistenceId ?? null,
    correlationId: data.correlationId ?? null,
    reason: data.reason ?? envelope.reason ?? null,
    updatedAt: new Date().toISOString(),
  };
  if (!writeExecuted) {
    audit.h3Status = data.rollbackExecuted ? "failed" : "blocked";
  }
  return { audit, writeExecuted };
}

/**
 * H4 — Clinical signature via existing consultations sign endpoint.
 */
export async function runCloseHitlH4Sign(input: {
  consultationId: string;
  signatureBase64: string;
  priorAudit: CloseHitlAuditTrail;
}): Promise<{ audit: CloseHitlAuditTrail }> {
  if (input.priorAudit.h3Status !== "executed" || !input.priorAudit.writeExecuted) {
    throw new Error("h3_required_before_h4");
  }
  await signConsultation(input.consultationId, input.signatureBase64);
  return {
    audit: {
      ...input.priorAudit,
      h4Status: "signed",
      reason: "h4_consultation_signed",
      updatedAt: new Date().toISOString(),
    },
  };
}

export function describeCloseHitlFlow(): {
  h1: typeof EPIC3_HITL_ACTS.H1_REVIEW_AI;
  h2: typeof EPIC3_HITL_ACTS.H2_APPROVE_ACTION;
  h3: typeof EPIC3_HITL_ACTS.H3_GOVERNED_PERSISTENCE;
  h4: typeof EPIC3_HITL_ACTS.H4_SIGN_CONSULTATION;
} {
  return {
    h1: EPIC3_HITL_ACTS.H1_REVIEW_AI,
    h2: EPIC3_HITL_ACTS.H2_APPROVE_ACTION,
    h3: EPIC3_HITL_ACTS.H3_GOVERNED_PERSISTENCE,
    h4: EPIC3_HITL_ACTS.H4_SIGN_CONSULTATION,
  };
}
