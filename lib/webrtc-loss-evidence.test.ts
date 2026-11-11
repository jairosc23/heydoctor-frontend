import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { calculatePacketLossDelta } from "./webrtc-network-deltas";

const hook = readFileSync(new URL("../hooks/useTelemedicineCall.ts", import.meta.url), "utf8");

describe("M4 RTP loss evidence integrity", () => {
  it("never claims verified zero loss when remote loss counters are unavailable", () => {
    assert.match(hook, /lossCounterAvailable\?: boolean/);
    assert.match(hook, /const hasLossCounter = snap\.lossCounterAvailable === true/);
    assert.match(hook, /hasLossCounter \? previousCounters : null/);
    assert.match(hook, /previousCounters = hasLossCounter \? \{ lost, sent \} : null/);
    assert.match(hook, /lossCounterAvailable: hasLossCounter/);
  });

  it("ignores the first credible sample as a baseline, not a zero-loss interval", () => {
    const first = calculatePacketLossDelta(null, { lost: 0, sent: 100 });
    assert.equal(first.reset, true);
    assert.equal(first.sentDelta, 0);
  });

  it("measures the next interval without using lifetime RTP counters", () => {
    const observed = calculatePacketLossDelta({ lost: 0, sent: 100 }, { lost: 15, sent: 160 });
    assert.equal(observed.reset, false);
    assert.equal(observed.lossRatio, 0.25);
  });

  it("does not trigger an upgrade from an unverified counter reset", () => {
    assert.match(hook, /!delta\.reset\s*&&\s*delta\.sentDelta > 0/);
  });
});
