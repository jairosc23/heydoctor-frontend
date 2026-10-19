/**
 * EPIC-3 H1 orchestration — approve/reject AI runs (contract SSOT).
 * Session cache may mirror decisions; Governance endpoints are source of truth.
 */

import { approveAiRun, rejectAiRun } from "@/lib/services/ai-run-review";

export type H1RunDecision = "approved" | "rejected";

export const H1_REJECT_REASON_UC04B =
  "Descartado en Clinical Review Workspace (EPIC-3 UC-04B)";

/**
 * Ensure aiRun is approved via POST /ai/runs/:id/approve.
 * Idempotent when alreadyApprovedInSession.
 */
export async function ensureH1ApproveAiRun(input: {
  aiRunId: string;
  alreadyApprovedInSession: boolean;
  overrideReason?: string;
}): Promise<{ ok: true; decision: "approved" } | { ok: false; error: string }> {
  if (input.alreadyApprovedInSession) {
    return { ok: true, decision: "approved" };
  }
  try {
    await approveAiRun(input.aiRunId, input.overrideReason);
    return { ok: true, decision: "approved" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "h1_approve_failed";
    // If already approved server-side, treat as success for Close flow.
    if (/already|aprobad|approved/i.test(message)) {
      return { ok: true, decision: "approved" };
    }
    return { ok: false, error: message };
  }
}

/**
 * Ensure aiRun is rejected via POST /ai/runs/:id/reject.
 * Only when the whole run is discarded in session.
 */
export async function ensureH1RejectAiRun(input: {
  aiRunId: string;
  alreadyRejectedInSession: boolean;
  rejectionReason?: string;
}): Promise<{ ok: true; decision: "rejected" } | { ok: false; error: string }> {
  if (input.alreadyRejectedInSession) {
    return { ok: true, decision: "rejected" };
  }
  try {
    await rejectAiRun(
      input.aiRunId,
      input.rejectionReason ?? H1_REJECT_REASON_UC04B,
    );
    return { ok: true, decision: "rejected" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "h1_reject_failed";
    if (/already|rechaz|rejected/i.test(message)) {
      return { ok: true, decision: "rejected" };
    }
    return { ok: false, error: message };
  }
}
