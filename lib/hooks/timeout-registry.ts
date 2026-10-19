export type TimeoutHandle = ReturnType<typeof setTimeout>;

export type TimeoutClock = {
  setTimeout(fn: () => void, ms: number): TimeoutHandle;
  clearTimeout(id: TimeoutHandle): void;
};

export type TimeoutRegistry = {
  set(fn: () => void, ms: number): TimeoutHandle;
  clearAll(): void;
};

export function createTimeoutRegistry(
  clock: TimeoutClock = globalThis,
): TimeoutRegistry {
  const ids = new Set<TimeoutHandle>();
  return {
    set(fn, ms) {
      const id = clock.setTimeout(() => {
        ids.delete(id);
        fn();
      }, ms);
      ids.add(id);
      return id;
    },
    clearAll() {
      for (const id of ids) clock.clearTimeout(id);
      ids.clear();
    },
  };
}
