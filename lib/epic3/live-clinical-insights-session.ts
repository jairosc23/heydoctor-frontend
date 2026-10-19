/**
 * EPIC-3 UC-03C — Session-local storage for live clinical insights.
 * Keyed by Medical Copilot sessionId. Never writes EMR / Consultation.
 */

import type { LiveClinicalInsightsBatch } from "./live-clinical-insights";

const PREFIX = "epic3:uc03c:live-clinical-insights:";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function liveInsightsStorageKey(sessionId: string): string {
  return `${PREFIX}${sessionId}`;
}

export function loadLiveClinicalInsightsBatch(
  sessionId: string | null | undefined,
): LiveClinicalInsightsBatch | null {
  if (!sessionId) return null;
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(liveInsightsStorageKey(sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveClinicalInsightsBatch;
    if (!parsed || !Array.isArray(parsed.insights)) return null;
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

export function saveLiveClinicalInsightsBatch(
  batch: LiveClinicalInsightsBatch,
): void {
  if (!batch.sessionId) return;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(
      liveInsightsStorageKey(batch.sessionId),
      JSON.stringify({
        ...batch,
        persistsToEmr: false,
        readOnlyEmr: true,
      }),
    );
  } catch {
    /* ignore quota */
  }
}

export function clearLiveClinicalInsightsBatch(sessionId: string | null): void {
  if (!sessionId) return;
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(liveInsightsStorageKey(sessionId));
  } catch {
    /* ignore */
  }
}
