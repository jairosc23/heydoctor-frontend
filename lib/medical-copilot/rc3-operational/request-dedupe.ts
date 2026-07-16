type InflightMap = Map<string, Promise<unknown>>;

const inflight: InflightMap = new Map();

/** Deduplica GETs idénticos en vuelo (mismo path). */
export function dedupeInflight<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const promise = factory().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

export function __rc3ClearInflightForTests(): void {
  inflight.clear();
}
