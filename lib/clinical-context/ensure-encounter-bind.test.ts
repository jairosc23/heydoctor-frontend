import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  ensureEncounterContextBound,
  resetEncounterContextBindForTests,
} from "./ensure-encounter-bind";

describe("ensureEncounterContextBound", () => {
  beforeEach(() => {
    resetEncounterContextBindForTests();
  });

  it("rejects an empty consultation id without calling bind", async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        ensureEncounterContextBound("  ", async () => {
          calls += 1;
        }),
      /consultationId is required/,
    );
    assert.equal(calls, 0);
  });

  it("calls bind once per consultation", async () => {
    let calls = 0;
    await ensureEncounterContextBound("consult-1", async () => {
      calls += 1;
    });
    await ensureEncounterContextBound("consult-1", async () => {
      calls += 1;
    });
    assert.equal(calls, 1);
  });

  it("coalesces concurrent binds for the same consultation", async () => {
    let calls = 0;
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const bind = async () => {
      calls += 1;
      await gate;
    };
    const first = ensureEncounterContextBound("consult-2", bind);
    const second = ensureEncounterContextBound("consult-2", bind);
    release();
    await Promise.all([first, second]);
    assert.equal(calls, 1);
  });

  it("does not mark success when bind fails, so a later open can retry", async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        ensureEncounterContextBound("consult-3", async () => {
          calls += 1;
          throw new Error("bind_failed");
        }),
      /bind_failed/,
    );
    await ensureEncounterContextBound("consult-3", async () => {
      calls += 1;
    });
    assert.equal(calls, 2);
  });
});
