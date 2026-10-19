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
import { assertContinuityHydrationDraft } from "@/lib/continuity-platform/assert-hydration-draft";
import { emitContinuityHintEvent } from "@/lib/continuity-platform/hint-events-client";
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
      const result = fail(handoffId, "context_missing");
      emitContinuityHintEvent({
        eventType: "handoff_failed",
        patientId: actor.patientId,
        encounterId: encounterId ?? null,
        hintId: hint?.hintId ?? null,
        handoffId,
        resultCode: "context_missing",
      });
      return result;
    }
    if (context.patientId !== actor.patientId) {
      const result = fail(handoffId, "patient_mismatch");
      emitContinuityHintEvent({
        eventType: "handoff_failed",
        patientId: actor.patientId,
        encounterId: encounterId ?? null,
        hintId: hint.hintId,
        handoffId,
        resultCode: "patient_mismatch",
      });
      return result;
    }

    emitContinuityHintEvent({
      eventType: "handoff_requested",
      patientId: actor.patientId,
      encounterId: encounterId ?? context.encounterId ?? null,
      hintId: hint.hintId,
      sourceKind: hint.sourceKind,
      handoffId,
    });

    let draft: ContinuityHydrationDraft;
    try {
      draft = toClinicalAssistPrefillDraftFromContinuityHint(hint, actor);
    } catch {
      const result = fail(handoffId, "invalid_hint");
      emitContinuityHintEvent({
        eventType: "handoff_failed",
        patientId: actor.patientId,
        encounterId: encounterId ?? context.encounterId ?? null,
        hintId: hint.hintId,
        sourceKind: hint.sourceKind,
        handoffId,
        resultCode: "invalid_hint",
      });
      return result;
    }
    ephemeralDraft = draft;

    const gate = resolveContinuityHydrationGate(hint);
    if (gate === "assertContinuityHydrationDraft") {
      try {
        draft = assertContinuityHydrationDraft(draft, hint);
        ephemeralDraft = draft;
      } catch {
        const result = fail(handoffId, "assert_denied");
        emitContinuityHintEvent({
          eventType: "handoff_failed",
          patientId: actor.patientId,
          encounterId: encounterId ?? context.encounterId ?? null,
          hintId: hint.hintId,
          sourceKind: hint.sourceKind,
          handoffId,
          resultCode: "assert_denied",
        });
        return result;
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

    ephemeralDraft = null;
    if (result.ok) {
      emitContinuityHintEvent({
        eventType: "handoff_succeeded",
        patientId: actor.patientId,
        encounterId: encounterId ?? context.encounterId ?? null,
        hintId: hint.hintId,
        sourceKind: hint.sourceKind,
        handoffId: result.handoffId,
        resultCode: "ok",
      });
    } else {
      emitContinuityHintEvent({
        eventType: "handoff_failed",
        patientId: actor.patientId,
        encounterId: encounterId ?? context.encounterId ?? null,
        hintId: hint.hintId,
        sourceKind: hint.sourceKind,
        handoffId: result.handoffId,
        resultCode: result.code,
      });
    }
    return result;
  } catch {
    ephemeralDraft = null;
    const result = fail(handoffId, "handoff_rejected");
    emitContinuityHintEvent({
      eventType: "handoff_failed",
      patientId: input.actor.patientId,
      encounterId: input.encounterId ?? null,
      hintId: input.hint?.hintId ?? null,
      handoffId,
      resultCode: "handoff_rejected",
    });
    return result;
  } finally {
    ephemeralDraft = null;
    handoffInFlight = false;
  }
}

/** Test helper */
export function __resetContinuityHandoffLockForTests(): void {
  handoffInFlight = false;
}
