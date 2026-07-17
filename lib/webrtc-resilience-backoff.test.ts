import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import {
  computeWebrtcReconnectDelay,
  jitterWebrtcDelay,
} from "./webrtc-backoff";

describe("webrtc reconnect backoff (F2-07)", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("computeWebrtcReconnectDelay grows exponentially and caps at maxMs", () => {
    mock.method(Math, "random", () => 0.5); // jitter factor = 1.0
    assert.equal(computeWebrtcReconnectDelay(0, 1000, 18_000), 1000);
    assert.equal(computeWebrtcReconnectDelay(1, 1000, 18_000), 2000);
    assert.equal(computeWebrtcReconnectDelay(2, 1000, 18_000), 4000);
    assert.equal(computeWebrtcReconnectDelay(10, 1000, 18_000), 18_000);
  });

  it("jitterWebrtcDelay stays within ±20%", () => {
    mock.method(Math, "random", () => 0);
    assert.equal(jitterWebrtcDelay(1000), 800);
    mock.method(Math, "random", () => 1);
    assert.equal(jitterWebrtcDelay(1000), 1200);
  });
});
