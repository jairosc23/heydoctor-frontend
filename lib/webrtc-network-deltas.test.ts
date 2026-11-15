import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePacketLossDelta } from "./webrtc-network-deltas";

describe("interval-based RTP loss", () => {
  it("does not infer packet loss from an initial lifetime counter", () => {
    assert.deepEqual(calculatePacketLossDelta(null, { sent: 10000, lost: 500 }), {
      lossRatio: 0, sentDelta: 0, lostDelta: 0, reset: true,
    });
  });
  it("detects 25% loss from 20 lost of 80 transmitted packets", () => {
    const result = calculatePacketLossDelta(
      { sent: 10000, lost: 500 },
      { sent: 10080, lost: 520 },
    );
    assert.equal(result.sentDelta, 80);
    assert.equal(result.lostDelta, 20);
    assert.equal(result.lossRatio, 0.25);
    assert.equal(result.reset, false);
  });
  it("does not divide by zero when no RTP packets were transmitted", () => {
    assert.equal(
      calculatePacketLossDelta({ sent: 70, lost: 2 }, { sent: 70, lost: 2 }).lossRatio,
      0,
    );
  });
  it("resets safely across ICE renegotiation or counter rollover", () => {
    assert.deepEqual(calculatePacketLossDelta(
      { sent: 10000, lost: 80 },
      { sent: 3, lost: 0 },
    ), { lossRatio: 0, sentDelta: 0, lostDelta: 0, reset: true });
  });
  it("ignores invalid metrics rather than declaring false packet loss", () => {
    assert.equal(calculatePacketLossDelta({ sent: 1, lost: 0 }, { sent: NaN, lost: 1 }).reset, true);
  });
});
