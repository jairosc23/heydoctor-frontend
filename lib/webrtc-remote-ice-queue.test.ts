import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_PENDING_REMOTE_ICE_CANDIDATES,
  RemoteIceCandidateQueue,
  matchesRemoteIceGeneration,
} from "./webrtc-remote-ice-queue";

const remote = { type: "offer" as const, sdp: "v=0\r\na=ice-ufrag:newgen\r\n" };
const candidate = (usernameFragment: string) => ({
  candidate: "candidate:1 1 UDP 1 192.0.2.1 5000 typ host",
  sdpMid: "0",
  usernameFragment,
});

test("queues candidates arriving before SDP and drains only the matching generation", () => {
  const queue = new RemoteIceCandidateQueue();
  queue.enqueue(candidate("newgen"));
  queue.enqueue(candidate("oldgen"));
  assert.equal(queue.drain(null).length, 0);
  assert.equal(queue.size, 2);
  assert.deepEqual(queue.drain(remote), [candidate("newgen")]);
  assert.equal(queue.size, 1);
  assert.deepEqual(queue.drain({ type: "offer", sdp: "v=0\r\na=ice-ufrag:oldgen\r\n" }), [candidate("oldgen")]);
  assert.equal(queue.size, 0);
});

test("future generation waits until matching remote SDP", () => {
  const queue = new RemoteIceCandidateQueue();
  queue.enqueue(candidate("next"));
  assert.equal(matchesRemoteIceGeneration(candidate("next"), remote), false);
  const next = { type: "offer" as const, sdp: "v=0\r\na=ice-ufrag:next\r\n" };
  assert.equal(queue.drain(next).length, 1);
});

test("legacy candidates without a usernameFragment are delegated to browser validation", () => {
  assert.equal(matchesRemoteIceGeneration({ candidate: "candidate:1" }, remote), true);
});

test("queue remains bounded and teardown clears all pending candidates", () => {
  const queue = new RemoteIceCandidateQueue();
  for (let i = 0; i < MAX_PENDING_REMOTE_ICE_CANDIDATES + 4; i++) {
    queue.enqueue(candidate("future" + i));
  }
  assert.equal(queue.size, MAX_PENDING_REMOTE_ICE_CANDIDATES);
  queue.clear();
  assert.equal(queue.size, 0);
});
