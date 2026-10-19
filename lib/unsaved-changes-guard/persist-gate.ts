/** Synchronous gate so "Salir sin guardar" can block every persist path. */
export type PersistGate = {
  discard: () => void;
  shouldPersist: () => boolean;
};

export function createPersistGate(): PersistGate {
  let discarded = false;
  return {
    discard() {
      discarded = true;
    },
    shouldPersist() {
      return !discarded;
    },
  };
}
