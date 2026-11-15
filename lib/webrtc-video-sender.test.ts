import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveRetainedVideoSender } from "./webrtc-video-sender";

type Sender = { track: { kind: string } | null };
describe("video sender retained through network suspension", () => {
  it("recovers the same sender after replaceTrack(null)", () => {
    const audio: Sender = { track: { kind: "audio" } };
    const video: Sender = { track: { kind: "video" } };
    const senders = [audio, video];
    assert.equal(resolveRetainedVideoSender(senders, video), video);
    video.track = null;
    assert.equal(resolveRetainedVideoSender(senders, video), video);
  });
  it("never returns stale senders from a closed peer", () => {
    const old: Sender = { track: null };
    const fresh: Sender = { track: { kind: "video" } };
    assert.equal(resolveRetainedVideoSender([fresh], old), fresh);
    assert.equal(resolveRetainedVideoSender([], old), null);
  });
  it("never confuses audio and video", () => {
    const audio: Sender = { track: { kind: "audio" } };
    assert.equal(resolveRetainedVideoSender([audio], null), null);
  });
});
