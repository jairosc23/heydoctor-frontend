import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  withFeTimeout,
  Rc5FeTimeoutError,
  __rc5FeResetResilienceForTests,
  rc5FeResilienceStats,
} from "./resilience";
import {
  recordRc5PackageResolution,
  recordRc5LazyHydration,
  snapshotRc5FeObservability,
  __rc5ClearFeObservabilityForTests,
  percentile,
} from "./observability";

describe("RC5 FE operational", () => {
  it("times out slow gets", async () => {
    __rc5FeResetResilienceForTests();
    await assert.rejects(
      () => withFeTimeout(new Promise((r) => setTimeout(r, 40)), "/x", 5),
      (e: unknown) => e instanceof Rc5FeTimeoutError,
    );
    assert.ok(rc5FeResilienceStats().timeouts >= 1);
  });

  it("computes package/lazy percentiles", () => {
    __rc5ClearFeObservabilityForTests();
    for (let i = 1; i <= 20; i++) {
      recordRc5PackageResolution(i);
      recordRc5LazyHydration(i * 2);
    }
    const snap = snapshotRc5FeObservability();
    assert.equal(snap.packageResolution.count, 20);
    assert.ok(snap.packageResolution.p95 >= snap.packageResolution.p50);
    assert.equal(percentile([1, 2, 3, 4], 50), 2);
  });
});
