/**
 * PR-11 CCP Wave C2 — sole Composer entry for Continuity hydration handoff.
 * Does not emit, does not bypass Confirmation Gate, does not POST prescriptions.
 */

import type { ClinicalAssistPrefillDraft, ComposerLifecycleState } from "./types";

export type ContinuityHandoffErrorCode =
  | "composer_busy"
  | "assert_denied"
  | "invalid_hint"
  | "context_missing"
  | "patient_mismatch"
  | "handoff_rejected"
  | "in_flight";

export type ContinuityHandoffRequest = {
  /** Correlation only — never a CompositionState key */
  handoffId: string;
  patientId: string;
  encounterId?: string | null;
  hintId: string;
  draft: ClinicalAssistPrefillDraft;
  hydrationGate: "validate-echo" | "assertContinuityHydrationDraft";
};

export type ContinuityHandoffResult =
  | { ok: true; handoffId: string; composerLifecycle: "HYDRATED" }
  | { ok: false; handoffId: string; code: ContinuityHandoffErrorCode };

/**
 * TD1 — block-only busy policy.
 * Allow: EMPTY, EMITTED, or null (no CompositionState).
 * Block: HYDRATED, EDITED, CONFIRMED.
 */
export function isComposerBusyForContinuityHandoff(
  lifecycle: ComposerLifecycleState | null | undefined,
): boolean {
  if (lifecycle == null || lifecycle === "EMPTY" || lifecycle === "EMITTED") {
    return false;
  }
  return true;
}

export type ContinuityHydrationApplier = (
  req: ContinuityHandoffRequest,
) => Promise<ContinuityHandoffResult>;

let registeredApplier: ContinuityHydrationApplier | null = null;

/** PrescriptionPanel (Composer host) registers the applier while mounted. */
export function registerContinuityHydrationApplier(
  fn: ContinuityHydrationApplier | null,
): void {
  registeredApplier = fn;
}

/**
 * TDR3 — unique Composer entry surface for Continuity → HYDRATED.
 */
export async function applyContinuityHydrationDraft(
  req: ContinuityHandoffRequest,
): Promise<ContinuityHandoffResult> {
  if (!registeredApplier) {
    return {
      ok: false,
      handoffId: req.handoffId,
      code: "handoff_rejected",
    };
  }
  return registeredApplier(req);
}
