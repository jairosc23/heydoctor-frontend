import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BASELINE_VIDEO_BITRATE_BPS,
  PREMIUM_VIDEO_BITRATE_BPS,
  PREMIUM_REQUIRED_STABLE_SAMPLES,
  intervalVideoLossRatio,
  hasPremiumVideoHeadroom,
  shouldExitPremiumVideo,
} from "./webrtc-premium-video-profile";

test("premium profile starts above certified baseline without changing resolution", () => {
  assert.equal(BASELINE_VIDEO_BITRATE_BPS, 1_400_000);
  assert.equal(PREMIUM_VIDEO_BITRATE_BPS, 2_000_000);
  assert.equal(PREMIUM_REQUIRED_STABLE_SAMPLES, 8);
});

test("interval loss uses deltas, not lifetime packet totals", () => {
  assert.equal(intervalVideoLossRatio(null, { lost: 500, sent: 10_000 }), 0);
  assert.equal(intervalVideoLossRatio({ lost: 500, sent: 10_000 }, { lost: 502, sent: 10_198 }), 0.01);
  assert.equal(intervalVideoLossRatio({ lost: 7, sent: 1_000 }, { lost: 1, sent: 2 }), 0);
  assert.equal(intervalVideoLossRatio({ lost: 3, sent: 4 }, { lost: 3, sent: 4 }), 0);
});

test("premium bitrate is enabled only with sustained eligible network measurements", () => {
  const good = { intervalLossRatio: 0.002, rttMs: 35, availableOutgoingBitrateBps: 3_100_000, packetsSentInInterval: 250 };
  assert.equal(hasPremiumVideoHeadroom(good), true);
  assert.equal(hasPremiumVideoHeadroom({ ...good, availableOutgoingBitrateBps: undefined }), false);
  assert.equal(hasPremiumVideoHeadroom({ ...good, availableOutgoingBitrateBps: 2_000_000 }), false);
  assert.equal(hasPremiumVideoHeadroom({ ...good, rttMs: undefined }), false);
  assert.equal(hasPremiumVideoHeadroom({ ...good, packetsSentInInterval: 0 }), false);
  assert.equal(hasPremiumVideoHeadroom({ ...good, intervalLossRatio: 0.03 }), false);
});

test("premium exits early for congestion and stays on when reports are temporarily missing", () => {
  const good = { intervalLossRatio: 0.001, rttMs: 35, availableOutgoingBitrateBps: 3_100_000, packetsSentInInterval: 200 };
  assert.equal(shouldExitPremiumVideo(good), false);
  assert.equal(shouldExitPremiumVideo({ ...good, intervalLossRatio: 0.03 }), true);
  assert.equal(shouldExitPremiumVideo({ ...good, rttMs: 270 }), true);
  assert.equal(shouldExitPremiumVideo({ ...good, availableOutgoingBitrateBps: 2_100_000 }), true);
  assert.equal(shouldExitPremiumVideo({ ...good, availableOutgoingBitrateBps: undefined }), false);
});
