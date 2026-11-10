import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decideCallRecovery,
  RECOVERY_POLICY,
  type RecoverySnapshot,
} from "./webrtc-reliability-core";

const nowMs = 100_000;
const base: RecoverySnapshot = {
  nowMs,
  socketConnected: true,
  roomJoined: true,
  remotePeerPresent: true,
  iceState: "disconnected",
  connectionState: "disconnected",
  degradedSinceMs: nowMs - 31_000,
  iceRestarts: 2,
  lastIceRestartMs: nowMs - 9_000,
  rebuilds: 0,
  lastRebuildMs: null,
  isInitiator: true,
  pageVisible: true,
};

describe("M4 enterprise recovery policy", () => {
  it("never sends signaling until server authorization and room rejoin ACK", () => {
    assert.equal(decideCallRecovery({ ...base, roomJoined: false }), "wait");
    assert.equal(decideCallRecovery({ ...base, socketConnected: false }), "wait");
  });
  it("does not rebuild while a peer has left or the page is backgrounded", () => {
    assert.equal(decideCallRecovery({ ...base, remotePeerPresent: false }), "wait");
    assert.equal(decideCallRecovery({ ...base, pageVisible: false }), "wait");
    assert.equal(decideCallRecovery({ ...base, isInitiator: false }), "wait");
  });
  it("tries ICE before escalating to full media reconstruction", () => {
    assert.equal(decideCallRecovery({
      ...base, degradedSinceMs: nowMs - 10_000, iceRestarts: 0,
    }), "ice-restart");
    assert.equal(decideCallRecovery({
      ...base, degradedSinceMs: nowMs - 6_000,
    }), "wait");
  });
  it("rebuilds only after sustained degradation and multiple ICE attempts", () => {
    assert.equal(decideCallRecovery(base), "rebuild");
    assert.equal(decideCallRecovery({ ...base, iceRestarts: 1 }), "ice-restart");
  });
  it("does not allow unbounded rebuild storms", () => {
    assert.equal(decideCallRecovery({
      ...base, rebuilds: RECOVERY_POLICY.maxRebuildsPerSession,
      lastIceRestartMs: nowMs - 1_000,
    }), "wait");
    assert.equal(decideCallRecovery({
      ...base, rebuilds: 1, lastRebuildMs: nowMs - 10_000,
      lastIceRestartMs: nowMs - 1_000,
    }), "wait");
  });
  it("never treats recovered transport or invalid clocks as degraded", () => {
    assert.equal(decideCallRecovery({
      ...base, iceState: "connected", connectionState: "connected",
    }), "wait");
    assert.equal(decideCallRecovery({
      ...base, degradedSinceMs: nowMs + 1,
    }), "wait");
  });
});
