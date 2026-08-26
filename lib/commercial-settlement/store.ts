import {
  SettlementIntegrityError,
  SettlementPersistenceError,
  isCompleteSettlementIdentity,
  type CommercialSettlementSnapshot,
  type EncounterId,
  type SettlementId,
} from "./types";

const SNAPSHOT_PREFIX = "hd.commercial-settlement.v1:";
const INDEX_PREFIX = "hd.commercial-settlement.current.v1:";

export type SettlementStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
};

const memoryById = new Map<SettlementId, CommercialSettlementSnapshot>();
const memoryByEncounter = new Map<EncounterId, SettlementId>();

function createMemoryStorage(): SettlementStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    keys: () => [...map.keys()],
  };
}

const fallbackMemoryStorage = createMemoryStorage();
let injectedStorage: SettlementStorage | null = null;

function tryLocalStorage(): SettlementStorage | null {
  if (typeof localStorage === "undefined") return null;
  return {
    getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      localStorage.setItem(key, value);
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* private mode */
      }
    },
    keys() {
      const keys: string[] = [];
      try {
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
      } catch {
        return keys;
      }
      return keys;
    },
  };
}

function activeStorage(): SettlementStorage {
  if (injectedStorage) return injectedStorage;
  return tryLocalStorage() ?? fallbackMemoryStorage;
}

/** Test seam for CS-10 rollback. Production callers must not use this. */
export function useSettlementStorageForTests(
  storage: SettlementStorage | null,
): void {
  injectedStorage = storage;
}

export function snapshotStorageKey(settlementId: SettlementId): string {
  return `${SNAPSHOT_PREFIX}${settlementId}`;
}

export function encounterIndexKey(encounterId: EncounterId): string {
  return `${INDEX_PREFIX}${encounterId}`;
}

function parseSnapshot(raw: string | null): CommercialSettlementSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CommercialSettlementSnapshot;
    if (!isCompleteSettlementIdentity(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function restoreKey(
  storage: SettlementStorage,
  key: string,
  previous: string | null,
): void {
  if (previous == null) {
    storage.removeItem(key);
    return;
  }
  storage.setItem(key, previous);
}

function commitMemory(snapshot: CommercialSettlementSnapshot): void {
  memoryById.set(snapshot.settlementId, snapshot);
  memoryByEncounter.set(snapshot.encounterId, snapshot.settlementId);
}

function restoreMemory(input: {
  settlementId: SettlementId;
  encounterId: EncounterId;
  previousSnapshot: CommercialSettlementSnapshot | undefined;
  previousEncounterId: SettlementId | undefined;
}): void {
  if (input.previousSnapshot) {
    memoryById.set(input.settlementId, input.previousSnapshot);
  } else {
    memoryById.delete(input.settlementId);
  }
  if (input.previousEncounterId) {
    memoryByEncounter.set(input.encounterId, input.previousEncounterId);
  } else {
    memoryByEncounter.delete(input.encounterId);
  }
}

/**
 * CS-10 — persist snapshot + encounter index as one unit, or roll back both.
 */
export function persistSettlementAtomic(
  snapshot: CommercialSettlementSnapshot,
): CommercialSettlementSnapshot {
  if (!isCompleteSettlementIdentity(snapshot)) {
    throw new SettlementIntegrityError(
      "settlementId and encounterId must be born together",
    );
  }

  const existing = loadSettlementById(snapshot.settlementId);
  if (existing && existing.encounterId !== snapshot.encounterId) {
    throw new SettlementIntegrityError(
      "settlementId cannot be reassigned to another Encounter",
    );
  }

  const storage = activeStorage();
  const snapKey = snapshotStorageKey(snapshot.settlementId);
  const idxKey = encounterIndexKey(snapshot.encounterId);
  const previousSnapRaw = storage.getItem(snapKey);
  const previousIdxRaw = storage.getItem(idxKey);
  const previousMemorySnap = memoryById.get(snapshot.settlementId);
  const previousMemoryIdx = memoryByEncounter.get(snapshot.encounterId);

  try {
    storage.setItem(snapKey, JSON.stringify(snapshot));
    storage.setItem(idxKey, snapshot.settlementId);

    const writtenSnap = parseSnapshot(storage.getItem(snapKey));
    const writtenIdx = storage.getItem(idxKey);
    if (
      !writtenSnap ||
      writtenSnap.settlementId !== snapshot.settlementId ||
      writtenSnap.encounterId !== snapshot.encounterId ||
      writtenIdx !== snapshot.settlementId
    ) {
      throw new SettlementPersistenceError(
        "atomic persist verification failed",
      );
    }

    commitMemory(snapshot);
    return snapshot;
  } catch (error) {
    try {
      restoreKey(storage, snapKey, previousSnapRaw);
      restoreKey(storage, idxKey, previousIdxRaw);
    } catch {
      /* still surface the original failure */
    }
    restoreMemory({
      settlementId: snapshot.settlementId,
      encounterId: snapshot.encounterId,
      previousSnapshot: previousMemorySnap,
      previousEncounterId: previousMemoryIdx,
    });
    if (
      error instanceof SettlementIntegrityError ||
      error instanceof SettlementPersistenceError
    ) {
      throw error;
    }
    throw new SettlementPersistenceError(
      error instanceof Error ? error.message : "atomic persist failed",
    );
  }
}

export function loadSettlementById(
  settlementId: SettlementId,
): CommercialSettlementSnapshot | null {
  const cached = memoryById.get(settlementId);
  if (cached && isCompleteSettlementIdentity(cached)) {
    if (cached.settlementId !== settlementId) return null;
    return cached;
  }
  const parsed = parseSnapshot(
    activeStorage().getItem(snapshotStorageKey(settlementId)),
  );
  if (!parsed || parsed.settlementId !== settlementId) return null;
  memoryById.set(settlementId, parsed);
  return parsed;
}

export function loadSettlementByEncounterId(
  encounterId: EncounterId,
): CommercialSettlementSnapshot | null {
  const cachedId = memoryByEncounter.get(encounterId);
  if (cachedId) {
    const cached = loadSettlementById(cachedId);
    if (cached?.encounterId === encounterId) return cached;
    return null;
  }
  const indexedId = activeStorage().getItem(encounterIndexKey(encounterId));
  if (!indexedId) return null;
  const snapshot = loadSettlementById(indexedId);
  if (!snapshot || snapshot.encounterId !== encounterId) {
    return null;
  }
  memoryByEncounter.set(encounterId, snapshot.settlementId);
  return snapshot;
}

export function clearCommercialSettlements(): void {
  memoryById.clear();
  memoryByEncounter.clear();
  const storage = activeStorage();
  for (const key of storage.keys()) {
    if (key.startsWith(SNAPSHOT_PREFIX) || key.startsWith(INDEX_PREFIX)) {
      storage.removeItem(key);
    }
  }
  if (typeof localStorage === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (
        key?.startsWith(SNAPSHOT_PREFIX) ||
        key?.startsWith(INDEX_PREFIX)
      ) {
        keys.push(key);
      }
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}
