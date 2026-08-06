import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  __resetEncounterChromeMetricsForTests,
  getEncounterChromeMetrics,
  publishEncounterChromeHeight,
  subscribeEncounterChromeMetrics,
} from "./chrome-metrics";

describe("Encounter chrome metrics SSOT", () => {
  it("bumps version when chrome height changes and notifies subscribers", () => {
    __resetEncounterChromeMetricsForTests();
    const versions: number[] = [];
    const unsubscribe = subscribeEncounterChromeMetrics((m) => {
      versions.push(m.version);
    });

    publishEncounterChromeHeight(120);
    publishEncounterChromeHeight(120);
    publishEncounterChromeHeight(180);

    const metrics = getEncounterChromeMetrics();
    assert.equal(metrics.heightPx, 180);
    assert.ok(metrics.version >= 2);
    assert.ok(versions.includes(metrics.version));
    unsubscribe();
  });
});
