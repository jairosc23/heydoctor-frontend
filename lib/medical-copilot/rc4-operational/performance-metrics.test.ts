import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  recordRc4Render,
  recordRc4LazyLoad,
  recordRc4PackageHydration,
  snapshotRc4FePerformance,
  __rc4ClearFeMetricsForTests,
} from "./performance-metrics";

describe("RC4 FE performance metrics", () => {
  it("aggregates render/lazy/package samples", () => {
    __rc4ClearFeMetricsForTests();
    recordRc4Render("A", 4);
    recordRc4Render("B", 6);
    recordRc4LazyLoad("A", 1);
    recordRc4PackageHydration("orch", 12);
    const snap = snapshotRc4FePerformance();
    assert.equal(snap.renderCount, 2);
    assert.equal(snap.renderAvgMs, 5);
    assert.equal(snap.lazyLoadCount, 1);
    assert.equal(snap.packageHydrationCount, 1);
  });
});
