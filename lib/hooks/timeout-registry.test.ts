import test from "node:test";
import assert from "node:assert/strict";
import { createTimeoutRegistry, type TimeoutClock } from "./timeout-registry";

test("createTimeoutRegistry clears pending timers", () => {
  const pending = new Set<number>();
  let next = 1;
  const clock: TimeoutClock = {
    setTimeout(fn, _ms) {
      const id = next++;
      pending.add(id);
      void fn;
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout(id) {
      pending.delete(id as unknown as number);
    },
  };
  const registry = createTimeoutRegistry(clock);
  registry.set(() => undefined, 50);
  registry.set(() => undefined, 80);
  assert.equal(pending.size, 2);
  registry.clearAll();
  assert.equal(pending.size, 0);
});
