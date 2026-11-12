import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const source = readFileSync(new URL("../components/VideoCall.tsx", import.meta.url), "utf8");

describe("M4 remote rendered-frame fidelity contract", () => {
  it("uses presented video frames instead of assuming ICE connected means live video", () => {
    assert.match(source, /requestVideoFrameCallback\(observePresentedFrame\)/);
    assert.match(source, /lastPresentedAt = Date\.now\(\)/);
    assert.match(source, /Date\.now\(\) - lastPresentedAt >= 10000/);
  });

  it("cancels the frame observer on cleanup", () => {
    assert.match(source, /cancelVideoFrameCallback\(frameCallbackId\)/);
    assert.match(source, /cancelled = true/);
  });

  it("never treats unsupported or zero decoding counters as a frozen video", () => {
    assert.match(source, /if \(sample <= 0\)/);
    assert.match(source, /setRemoteVideoStalled\(false\)/);
  });
});
