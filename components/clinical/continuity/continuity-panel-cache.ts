/**
 * PR-10 C1 — memory cache lifecycle (create / use / invalidate / destroy).
 * I3 — fixed TTL policy: 5 minutes.
 */

import type { ContinuityContext } from "@/lib/continuity-platform/types";

/** I3 — single TTL policy (not optional). */
export const CONTINUITY_PANEL_CACHE_TTL_MS = 5 * 60 * 1000;

export type ContinuityCacheKey = string;

export type ContinuityCacheEntry = {
  key: ContinuityCacheKey;
  context: ContinuityContext;
  storedAt: number;
};

const panelCache = new Map<ContinuityCacheKey, ContinuityCacheEntry>();

export function buildContinuityCacheKey(
  patientId: string,
  encounterId?: string | null,
): ContinuityCacheKey {
  return `${patientId}::${encounterId ?? ""}`;
}

export function putContinuityCache(
  patientId: string,
  encounterId: string | null | undefined,
  context: ContinuityContext,
  now = Date.now(),
): void {
  const key = buildContinuityCacheKey(patientId, encounterId);
  panelCache.set(key, { key, context, storedAt: now });
}

/**
 * Apply cached context when key matches and TTL is valid.
 * Returns null on miss / expiry / key mismatch.
 */
export function readContinuityCache(
  patientId: string,
  encounterId?: string | null,
  now = Date.now(),
): ContinuityContext | null {
  const key = buildContinuityCacheKey(patientId, encounterId);
  const entry = panelCache.get(key);
  if (!entry) return null;
  if (entry.key !== key) return null;
  if (now - entry.storedAt > CONTINUITY_PANEL_CACHE_TTL_MS) {
    panelCache.delete(key);
    return null;
  }
  return entry.context;
}

/** Invalidate one key (patient/encounter scope). */
export function invalidateContinuityCacheKey(
  patientId: string,
  encounterId?: string | null,
): void {
  panelCache.delete(buildContinuityCacheKey(patientId, encounterId));
}

/** Destroy all cache entries for a patient (any encounter). */
export function destroyContinuityCacheForPatient(patientId: string): void {
  const prefix = `${patientId}::`;
  for (const key of panelCache.keys()) {
    if (key.startsWith(prefix)) panelCache.delete(key);
  }
}

export function clearAllContinuityPanelCache(): void {
  panelCache.clear();
}

/** Test helper */
export function continuityCacheSize(): number {
  return panelCache.size;
}
