import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { updateVideoFrameWatchdog } from "./webrtc-frame-watchdog";

describe("M4 outbound frame watchdog", () => {
  it("does not flag an initial sample or progressing frames", () => {
    const start = updateVideoFrameWatchdog({ lastFrames: null, stagnantSince: null }, 10, 1000);
    assert.equal(start.stalled, false);
    const next = updateVideoFrameWatchdog(start.state, 12, 12000);
    assert.equal(next.stalled, false);
  });
  it("detects eight seconds of missing outbound progress", () => {
    const first = updateVideoFrameWatchdog({ lastFrames: null, stagnantSince: null }, 20, 1000);
    assert.equal(updateVideoFrameWatchdog(first.state, 20, 8999).stalled, false);
    const stalled = updateVideoFrameWatchdog(first.state, 20, 9000);
    assert.equal(stalled.stalled, true);
    assert.equal(updateVideoFrameWatchdog(stalled.state, 20, 10000).stalled, true);
  });
  it("keeps a video interruption visible until new frames arrive", () => {
    const initial = updateVideoFrameWatchdog({ lastFrames: null, stagnantSince: null }, 40, 1000);
    const stalled = updateVideoFrameWatchdog(initial.state, 40, 9000);
    assert.equal(stalled.stalled, true);
    assert.equal(updateVideoFrameWatchdog(stalled.state, 40, 12000).stalled, true);
    assert.equal(updateVideoFrameWatchdog(stalled.state, 41, 12500).stalled, false);
  });
  it("resets invalid samples rather than triggering recovery", () => {
    assert.equal(updateVideoFrameWatchdog({lastFrames: 10, stagnantSince: 100}, NaN, 20000).stalled, false);
  });
  it("recovers from counter resets without false alarms", () => {
    assert.equal(updateVideoFrameWatchdog({lastFrames: 100, stagnantSince: 1000}, 0, 20000).stalled, false);
  });
});
