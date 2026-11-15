import assert from "node:assert/strict";
import { test } from "node:test";
import {
  advanceQualityState,
  deriveConnectionQuality,
  INITIAL_QUALITY_STATE,
} from "./webrtc-connection-quality";

test("temporary weak network sample does not flicker connected badge", () => {
  const weak = advanceQualityState(INITIAL_QUALITY_STATE, "weak");
  assert.equal(weak.visible, "good");
  assert.equal(advanceQualityState(weak, "good").visible, "good");
});

test("sustained weak signal is reported and stable recovery clears it", () => {
  const first = advanceQualityState(INITIAL_QUALITY_STATE, "weak");
  const degraded = advanceQualityState(first, "weak");
  assert.equal(degraded.visible, "weak");
  const recovering = advanceQualityState(degraded, "good");
  assert.equal(recovering.visible, "weak");
  assert.equal(advanceQualityState(recovering, "good").visible, "good");
});

test("severe degradation and ICE failures are never hidden", () => {
  assert.equal(advanceQualityState(INITIAL_QUALITY_STATE, "poor").visible, "poor");
  assert.equal(advanceQualityState(INITIAL_QUALITY_STATE, "failed").visible, "failed");
  assert.equal(advanceQualityState(INITIAL_QUALITY_STATE, "reconnecting").visible, "reconnecting");
});

test("hysteresis does not change raw quality metrics or ICE verdict", () => {
  const raw = deriveConnectionQuality({
    reconnecting: false,
    iceConnectionState: "connected",
    lossRatio: 0,
    rttMs: 320,
    outboundBitrateBps: 300_000,
    videoSuspendedForNetwork: false,
  });
  assert.equal(raw, "weak");
  assert.equal(advanceQualityState(INITIAL_QUALITY_STATE, raw).visible, "good");
  assert.equal(advanceQualityState(INITIAL_QUALITY_STATE, "reconnecting").visible, "reconnecting");
});
