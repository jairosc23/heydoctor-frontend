/**
 * EPIC-3 UC-04D — Session-local Close HITL audit trail.
 */

import type { CloseHitlAuditTrail } from "./close-hitl-execution";

const PREFIX = "epic3:uc04d:close-hitl:";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function closeHitlStorageKey(sessionId: string): string {
  return `${PREFIX}${sessionId}`;
}

export function loadCloseHitlAudit(
  sessionId: string | null | undefined,
): CloseHitlAuditTrail | null {
  if (!sessionId) return null;
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(closeHitlStorageKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as CloseHitlAuditTrail;
  } catch {
    return null;
  }
}

export function saveCloseHitlAudit(audit: CloseHitlAuditTrail): void {
  if (!audit.sessionId) return;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(closeHitlStorageKey(audit.sessionId), JSON.stringify(audit));
  } catch {
    /* ignore */
  }
}
