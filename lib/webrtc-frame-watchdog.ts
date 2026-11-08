/** Pure, bounded outbound-video progress detector; no media or clinical data. */
export type VideoFrameWatchdogState = {
  lastFrames: number | null;
  stagnantSince: number | null;
};
export function updateVideoFrameWatchdog(
  previous: VideoFrameWatchdogState,
  frames: number,
  now: number,
  thresholdMs = 8000,
): { state: VideoFrameWatchdogState; stalled: boolean } {
  if (!Number.isFinite(frames) || frames < 0 || !Number.isFinite(now)) {
    return { state: { lastFrames: null, stagnantSince: null }, stalled: false };
  }
  if (previous.lastFrames === null || frames !== previous.lastFrames) {
    return { state: { lastFrames: frames, stagnantSince: now }, stalled: false };
  }
  const since = previous.stagnantSince ?? now;
  const stalled = now - since >= thresholdMs;
  return {
    state: { lastFrames: frames, stagnantSince: stalled ? now : since },
    stalled,
  };
}
