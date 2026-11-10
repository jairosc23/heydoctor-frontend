import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const hook = readFileSync(
  new URL("../hooks/useTelemedicineCall.ts", import.meta.url),
  "utf8",
);

describe("M4 Premium continuous-video media contract", () => {
  it("never detaches an active sender because of network congestion", () => {
    const afterQualitySample = hook.split("onStatsSample: async ({ snap, lossRatio }) => {")[1];
    assert.ok(afterQualitySample, "RTP quality callback must exist");
    const adaptation = afterQualitySample.split("if (sendCallMetricsToBackend)")[0];
    assert.ok(adaptation, "adaptive monitor body must be present");
    assert.doesNotMatch(adaptation, /replaceTrack\s*\(\s*null\s*\)/);
    assert.doesNotMatch(adaptation, /videoSuspendedByPolicyRef\.current\s*=\s*true/);
    assert.match(hook, /await applyVideoTier\(getVideoSender\(\), tier\)/);
  });

  it("restores the camera after screen sharing without a congestion deadlock", () => {
    const restore = hook.split("const stopScreenShare = useCallback(async () => {")[1]
      ?.split("const startScreenShare")[0];
    assert.ok(restore, "camera restoration handler must exist");
    assert.match(restore, /await videoSender\.replaceTrack\(cam\)/);
    assert.doesNotMatch(restore, /videoSender\.replaceTrack\(null\)/);
  });
});
