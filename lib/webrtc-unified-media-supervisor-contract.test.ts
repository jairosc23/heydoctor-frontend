import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const supervisor = readFileSync(
  new URL("../hooks/useTelemedicineCall.ts", import.meta.url), "utf8",
);

describe("M4 unified audiovisual recovery architecture", () => {
  it("has exactly one interval supervising transport, camera and incoming video", () => {
    assert.equal((supervisor.match(/One media supervisor owns escalation/g) ?? []).length, 1);
    assert.equal((supervisor.match(/const id = window\.setInterval\(\(\) => \{ void supervise\(\); \}, 2500\)/g) ?? []).length, 1);
    assert.doesNotMatch(supervisor, /Receiver-side recovery: audio and ICE/);
    assert.doesNotMatch(supervisor, /Outbound frames monitor: an iOS track/);
  });

  it("prioritizes transport and authorization gates before inspecting video RTP", () => {
    const transport = supervisor.indexOf("const transportAction = decideCallRecovery({");
    const gate = supervisor.indexOf("if (transportDegraded || !authorized || !foreground)");
    const reports = supervisor.indexOf("const reports = await pc.getStats();", transport);
    assert.ok(transport !== -1 && gate > transport && reports > gate);
    assert.match(supervisor, /roomJoinedRef\.current && peerPresent/);
    assert.match(supervisor, /socket\.connected && roomJoinedRef\.current && peerPresent/);
  });

  it("recovers camera-only faults without closing audio or PeerConnection", () => {
    const camera = supervisor.indexOf("if (outbound.stalled && !recoveringCameraRef.current");
    const receiver = supervisor.indexOf("const inbound = assessInboundVideoRecovery(", camera);
    assert.ok(camera >= 0 && receiver > camera);
    const section = supervisor.slice(camera, receiver);
    assert.match(section, /void recoverCamera\(\)/);
    assert.doesNotMatch(section, /endCall\(|restart\(\)|\.close\(\)/);
  });

  it("never lets a receiver create competing SDP offers", () => {
    assert.match(supervisor, /if \(!canOffer\) \{\s*socket\.emit\("video-recovery-request"/);
    assert.match(supervisor, /lastIceFailureReasonRef\.current = "inbound_video_frames_stalled"/);
    assert.match(supervisor, /rebuildSession\("confirmed_decoded_frame_stall", nowMs\)/);
  });

  it("keeps full reconstruction capped and checks session authority", () => {
    assert.match(supervisor, /rebuildsRef\.current >= 2/);
    assert.match(supervisor, /nowMs - lastRebuildMsRef\.current < 60_000/);
    assert.match(supervisor, /if \(rebuildInProgressRef\.current \|\| !isInitiator \|\| externalSocket/);
  });
});
