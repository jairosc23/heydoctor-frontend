/**
 * EPIC-3 UC-04B — Session-local storage for Review & Selection decisions.
 * Keyed by Medical Copilot sessionId. Never writes EMR / Consultation.
 */

import type { ReviewSelectionState } from "./review-selection";

const PREFIX = "epic3:uc04b:review-selection:";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function reviewSelectionStorageKey(sessionId: string): string {
  return `${PREFIX}${sessionId}`;
}

export function loadReviewSelectionState(
  sessionId: string | null | undefined,
): ReviewSelectionState | null {
  if (!sessionId) return null;
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(reviewSelectionStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReviewSelectionState;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return {
      ...parsed,
      sessionId,
      h1ByAiRunId: parsed.h1ByAiRunId ?? {},
      items: (parsed.items ?? []).map((item) => ({
        ...item,
        promptVersion: item.promptVersion ?? null,
        h1Status: item.h1Status ?? (item.aiRunId ? "pending" : "not_applicable"),
      })),
      persistsToEmr: false,
      readOnlyEmr: true,
      generatesContent: false,
      runsGovernedPersistence: false,
      signsConsultation: false,
    };
  } catch {
    return null;
  }
}

export function saveReviewSelectionState(state: ReviewSelectionState): void {
  if (!state.sessionId) return;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(
      reviewSelectionStorageKey(state.sessionId),
      JSON.stringify({
        ...state,
        persistsToEmr: false,
        readOnlyEmr: true,
        generatesContent: false,
        runsGovernedPersistence: false,
        signsConsultation: false,
      }),
    );
  } catch {
    /* quota / private mode — keep in-memory only */
  }
}

export function clearReviewSelectionState(sessionId: string | null): void {
  if (!sessionId) return;
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(reviewSelectionStorageKey(sessionId));
  } catch {
    /* ignore */
  }
}
