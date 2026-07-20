/**
 * EPIC-3 UC-02B — Session-local storage for interview suggestions.
 * Keyed by Medical Copilot sessionId. Never writes EMR / Consultation.
 */

import type { InterviewSuggestionsBatch } from "./interview-suggestions";

const PREFIX = "epic3:uc02b:interview-suggestions:";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function interviewSuggestionsStorageKey(sessionId: string): string {
  return `${PREFIX}${sessionId}`;
}

export function loadInterviewSuggestionsBatch(
  sessionId: string | null | undefined,
): InterviewSuggestionsBatch | null {
  if (!sessionId) return null;
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(interviewSuggestionsStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InterviewSuggestionsBatch;
    if (!parsed || !Array.isArray(parsed.suggestions)) return null;
    return {
      ...parsed,
      sessionId,
      persistsToEmr: false,
      readOnlyEmr: true,
    };
  } catch {
    return null;
  }
}

export function saveInterviewSuggestionsBatch(
  batch: InterviewSuggestionsBatch,
): void {
  if (!batch.sessionId) return;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(
      interviewSuggestionsStorageKey(batch.sessionId),
      JSON.stringify({
        ...batch,
        persistsToEmr: false,
        readOnlyEmr: true,
      }),
    );
  } catch {
    /* quota / private mode — keep in-memory only */
  }
}

export function clearInterviewSuggestionsBatch(sessionId: string | null): void {
  if (!sessionId) return;
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(interviewSuggestionsStorageKey(sessionId));
  } catch {
    /* ignore */
  }
}
