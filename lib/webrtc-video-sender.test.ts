import { describe, expect, it } from "vitest";
import { resolveRetainedVideoSender } from "./webrtc-video-sender";

type Sender = { track: { kind: string } | null };
describe("video sender retained through network suspension", () => {
  it("recovers the same sender after replaceTrack(null)", () => {
    const audio: Sender = { track: { kind: "audio" } };
    const video: Sender = { track: { kind: "video" } };
    const senders = [audio, video];
    expect(resolveRetainedVideoSender(senders, video)).toBe(video);
    video.track = null;
    expect(resolveRetainedVideoSender(senders, video)).toBe(video);
  });
  it("never returns stale senders from a closed peer", () => {
    const old: Sender = { track: null };
    const fresh: Sender = { track: { kind: "video" } };
    expect(resolveRetainedVideoSender([fresh], old)).toBe(fresh);
    expect(resolveRetainedVideoSender([], old)).toBeNull();
  });
  it("never confuses audio and video", () => {
    const audio: Sender = { track: { kind: "audio" } };
    expect(resolveRetainedVideoSender([audio], null)).toBeNull();
  });
});
