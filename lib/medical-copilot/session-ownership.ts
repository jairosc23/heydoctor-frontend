/**
 * RC-2 P0-2 / P0-3 — Single session ownership per consultation.
 * SSOT for Medical Copilot sessionId. Adapter must never create sessions.
 */

export const MEDICAL_COPILOT_OWNERSHIP_STORAGE_KEY =
  "hd_mc_session_ownership_v1";

export type SessionOwnershipRecord = {
  consultationId: string;
  sessionId: string;
  updatedAt: string;
};

type OwnershipMap = Record<string, SessionOwnershipRecord>;

function readMap(storage: Pick<Storage, "getItem">): OwnershipMap {
  try {
    const raw = storage.getItem(MEDICAL_COPILOT_OWNERSHIP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OwnershipMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(
  storage: Pick<Storage, "setItem">,
  map: OwnershipMap,
): void {
  try {
    storage.setItem(MEDICAL_COPILOT_OWNERSHIP_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function resolveStorage(
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
): Pick<Storage, "getItem" | "setItem" | "removeItem"> | null {
  if (storage !== undefined) return storage;
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

/** Returns owned sessionId for consultation, if any. */
export function getOwnedMedicalCopilotSessionId(
  consultationId: string,
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
): string | null {
  const store = resolveStorage(storage);
  if (!store || !consultationId.trim()) return null;
  const rec = readMap(store)[consultationId.trim()];
  return rec?.sessionId?.trim() || null;
}

/** Remembers the single sessionId for this consultation (overwrites prior). */
export function rememberMedicalCopilotSessionOwnership(
  consultationId: string,
  sessionId: string,
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
): SessionOwnershipRecord | null {
  const store = resolveStorage(storage);
  if (!store) return null;
  const cid = consultationId.trim();
  const sid = sessionId.trim();
  if (!cid || !sid) return null;
  const map = readMap(store);
  const record: SessionOwnershipRecord = {
    consultationId: cid,
    sessionId: sid,
    updatedAt: new Date().toISOString(),
  };
  map[cid] = record;
  writeMap(store, map);
  return record;
}

export function clearMedicalCopilotSessionOwnership(
  consultationId: string,
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
): void {
  const store = resolveStorage(storage);
  if (!store) return;
  const map = readMap(store);
  delete map[consultationId.trim()];
  writeMap(store, map);
}

/**
 * Ensures only one sessionId is accepted for a consultation.
 * If an owner already exists and differs, keeps the owned id (reject duplicate).
 */
export function assertSingleSessionOwnership(
  consultationId: string,
  candidateSessionId: string,
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
): { sessionId: string; accepted: boolean; duplicateAttempt: boolean } {
  const owned = getOwnedMedicalCopilotSessionId(consultationId, storage);
  const candidate = candidateSessionId.trim();
  if (!owned) {
    rememberMedicalCopilotSessionOwnership(
      consultationId,
      candidate,
      storage,
    );
    return { sessionId: candidate, accepted: true, duplicateAttempt: false };
  }
  if (owned === candidate) {
    return { sessionId: owned, accepted: true, duplicateAttempt: false };
  }
  return { sessionId: owned, accepted: false, duplicateAttempt: true };
}
