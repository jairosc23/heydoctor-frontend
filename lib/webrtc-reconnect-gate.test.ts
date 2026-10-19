import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canScheduleIceRestart,
  shouldReportReconnectSuccess,
} from "./webrtc-reconnect-gate";

describe("webrtc-reconnect-gate (W2)", () => {
  it("does not report reconnect_success on first connect", () => {
    assert.equal(
      shouldReportReconnectSuccess({
        wasReconnecting: false,
        reconnectAttempts: 0,
      }),
      false,
    );
  });

  it("reports reconnect_success after ICE restart path", () => {
    assert.equal(
      shouldReportReconnectSuccess({
        wasReconnecting: true,
        reconnectAttempts: 1,
      }),
      true,
    );
  });

  it("enforces ICE restart caps and cooldown", () => {
    assert.equal(
      canScheduleIceRestart({
        iceRestartCount: 10,
        maxIceRestarts: 10,
        lastIceRestartAtMs: null,
        nowMs: 1000,
        minIntervalMs: 4500,
      }),
      false,
    );

    assert.equal(
      canScheduleIceRestart({
        iceRestartCount: 1,
        maxIceRestarts: 10,
        lastIceRestartAtMs: 1000,
        nowMs: 2000,
        minIntervalMs: 4500,
      }),
      false,
    );

    assert.equal(
      canScheduleIceRestart({
        iceRestartCount: 1,
        maxIceRestarts: 10,
        lastIceRestartAtMs: 1000,
        nowMs: 6000,
        minIntervalMs: 4500,
      }),
      true,
    );
  });
});
