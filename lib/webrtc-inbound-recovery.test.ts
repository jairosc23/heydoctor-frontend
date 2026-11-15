import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assessInboundVideoRecovery,
  INITIAL_INBOUND_RECOVERY_STATE,
} from "./webrtc-inbound-recovery";

const input = (framesDecoded: number | null, nowMs: number, canRebuild = true) => ({
  framesDecoded, nowMs, eligible: true, canRebuild,
});

describe("M4 inbound media progress recovery", () => {
  it("never repairs a call based on absent or zero counters", () => {
    let r = assessInboundVideoRecovery(INITIAL_INBOUND_RECOVERY_STATE, input(0, 0));
    assert.equal(r.action, "none");
    r = assessInboundVideoRecovery(r.state, input(0, 60_000));
    assert.equal(r.action, "none");
    assert.equal(assessInboundVideoRecovery(r.state, input(null, 65_000)).action, "none");
  });

  it("waits for twelve seconds of confirmed stagnant decoded frames", () => {
    const start = assessInboundVideoRecovery(INITIAL_INBOUND_RECOVERY_STATE, input(120, 1_000));
    assert.equal(assessInboundVideoRecovery(start.state, input(120, 12_999)).action, "none");
    const stalled = assessInboundVideoRecovery(start.state, input(120, 13_000));
    assert.equal(stalled.action, "ice-restart");
    assert.equal(stalled.state.restartAttempts, 1);
  });

  it("spaces two restarts and escalates only after prolonged silence", () => {
    const baseline = assessInboundVideoRecovery(INITIAL_INBOUND_RECOVERY_STATE, input(11, 1_000));
    const first = assessInboundVideoRecovery(baseline.state, input(11, 13_000));
    assert.equal(assessInboundVideoRecovery(first.state, input(11, 15_000)).action, "none");
    const second = assessInboundVideoRecovery(first.state, input(11, 28_000));
    assert.equal(second.action, "ice-restart");
    assert.equal(assessInboundVideoRecovery(second.state, input(11, 38_000)).action, "none");
    assert.equal(assessInboundVideoRecovery(second.state, input(11, 43_000, false)).action, "none");
    assert.equal(assessInboundVideoRecovery(second.state, input(11, 43_000)).action, "rebuild");
  });

  it("clears stale recovery evidence on decoded progress, hidden pages or absent peers", () => {
    const baseline = assessInboundVideoRecovery(INITIAL_INBOUND_RECOVERY_STATE, input(14, 1_000));
    const first = assessInboundVideoRecovery(baseline.state, input(14, 13_000));
    const progressed = assessInboundVideoRecovery(first.state, input(15, 14_000));
    assert.equal(progressed.state.restartAttempts, 0);
    assert.equal(progressed.action, "none");
    const hidden = assessInboundVideoRecovery(first.state, {
      ...input(14, 90_000), eligible: false,
    });
    assert.deepEqual(hidden.state, INITIAL_INBOUND_RECOVERY_STATE);
  });

  it("never calls for a rebuild before two bounded restart attempts", () => {
    const start = assessInboundVideoRecovery(INITIAL_INBOUND_RECOVERY_STATE, input(22, 0));
    const first = assessInboundVideoRecovery(start.state, input(22, 40_000));
    assert.equal(first.action, "ice-restart");
    assert.equal(assessInboundVideoRecovery(first.state, input(22, 55_000)).action, "ice-restart");
  });
});
