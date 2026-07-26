/**
 * PR-11 C2 — ContinuityHydrationHandoff orchestration.
 * Panel-side: lock, build draft (C0 adapter), assert/policy, callback to Composer.
 * No clinical writes. handoffInFlight cleared in finally (TDR1).
 */

import { applyContinuityHydrationDraft } from "@/lib/composer-intake/apply-continuity-hydration";
import type {
  ContinuityHandoffErrorCode,
  ContinuityHandoffResult,
} from "@/lib/composer-intake/apply-continuity-hydration";
import {
  toClinicalAssistPrefillDraftFromContinuityHint,
  type ContinuityHydrationActor,
  type ContinuityHydrationDraft,
} from "@/lib/continuity-platform/adapter";
import {
  assertContinuityHydrationDraft,
  ContinuityHydrationError,
} from "@/lib/continuity-platform/assert-hydration-draft";
import { resolveContinuityHydrationGate } from "@/lib/continuity-platform/hydration-policy";
import type {
  ContinuityContext,
  PassiveContinuityHint,
} from "@/lib/continuity-platform/types";

export type ContinuityHandoffInput = {
  hint: PassiveContinuityHint;
  context: ContinuityContext;
  actor: ContinuityHydrationActor;
  encounterId?: string | null;
};

/** Module lock — single active handoff per FE runtime (TD2). */
let handoffInFlight = false;

export function isContinuityHandoffInFlight(): boolean {
  return handoffInFlight;
}

function newHandoffId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `handoff-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fail(
  handoffId: string,
  code: ContinuityHandoffErrorCode,
): ContinuityHandoffResult {
  return { ok: false, handoffId, code };
}

/**
 * Runs one CTA attempt → at most one draft → one Composer callback.
 * Discards ephemeral draft on any failure (TDR5).
 */
export async function runContinuityHydrationHandoff(
  input: ContinuityHandoffInput,
): Promise<ContinuityHandoffResult> {
  if (handoffInFlight) {
    return fail(newHandoffId(), "in_flight");
  }

  handoffInFlight = true;
  const handoffId = newHandoffId();
  let ephemeralDraft: ContinuityHydrationDraft | null = null;

  try {
    const { hint, context, actor, encounterId } = input;

    if (!context?.patientId || !hint?.hintId) {
      return fail(handoffId, "context_missing");
    }
    if (context.patientId !== actor.patientId) {
      return fail(handoffId, "patient_mismatch");
    }

    let draft: ContinuityHydrationDraft;
    try {
      draft = toClinicalAssistPrefillDraftFromContinuityHint(hint, actor);
    } catch {
      return fail(handoffId, "invalid_hint");
    }
    ephemeralDraft = draft;

    const gate = resolveContinuityHydrationGate(hint);
    if (gate === "assertContinuityHydrationDraft") {
      try {
        draft = assertContinuityHydrationDraft(draft, hint);
        ephemeralDraft = draft;
      } catch (err) {
        if (err instanceof ContinuityHydrationError) {
          return fail(handoffId, "assert_denied");
        }
        return fail(handoffId, "assert_denied");
      }
    }

    // TDR4 — do not mutate draft after callback; freeze before transfer
    Object.freeze(draft);
    if (draft.medications) Object.freeze(draft.medications);
    if (draft.extensions) Object.freeze(draft.extensions);

    const result = await applyContinuityHydrationDraft({
      handoffId,
      patientId: actor.patientId,
      encounterId: encounterId ?? context.encounterId ?? null,
      hintId: hint.hintId,
      draft,
      hydrationGate: gate,
    });

    if (!result.ok) {
      ephemeralDraft = null;
    } else {
      // Ownership transferred — Panel must not retain draft
      ephemeralDraft = null;
    }
    return result;
  } catch {
    ephemeralDraft = null;
    return fail(handoffId, "handoff_rejected");
  } finally {
    ephemeralDraft = null;
    handoffInFlight = false;
  }
}

/** Test helper */
export function __resetContinuityHandoffLockForTests(): void {
  handoffInFlight = false;
}
