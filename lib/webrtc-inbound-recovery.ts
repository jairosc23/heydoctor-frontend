/**
 * Receiver-side evidence and bounded action policy for a media session whose
 * ICE/DTLS and audio can remain connected after remote video stops advancing.
 * No signaling, media, auth or patient data is handled here.
 */
export type InboundVideoRecoveryState = {
  lastFrames: number | null;
  stalledSinceMs: number | null;
  lastActionAtMs: number | null;
  restartAttempts: number;
};

export const INITIAL_INBOUND_RECOVERY_STATE: InboundVideoRecoveryState = {
  lastFrames: null,
  stalledSinceMs: null,
  lastActionAtMs: null,
  restartAttempts: 0,
};

export type InboundVideoRecoveryAction = "none" | "ice-restart" | "rebuild";

export function assessInboundVideoRecovery(
  prev: InboundVideoRecoveryState,
  input: {
    framesDecoded: number | null;
    nowMs: number;
    eligible: boolean;
    canRebuild: boolean;
  },
): { state: InboundVideoRecoveryState; action: InboundVideoRecoveryAction } {
  const { framesDecoded, nowMs, eligible, canRebuild } = input;
  if (!eligible || framesDecoded === null || !Number.isFinite(framesDecoded) ||
      !Number.isFinite(nowMs) || framesDecoded < 0) {
    return { state: INITIAL_INBOUND_RECOVERY_STATE, action: "none" };
  }
  // Do not treat missing/zero stats or the first decoded frame as a stall.
  if (framesDecoded === 0 || prev.lastFrames === null ||
      framesDecoded !== prev.lastFrames) {
    return {
      state: { lastFrames: framesDecoded, stalledSinceMs: nowMs,
        lastActionAtMs: null, restartAttempts: 0 },
      action: "none",
    };
  }
  const state: InboundVideoRecoveryState = {
    ...prev,
    stalledSinceMs: prev.stalledSinceMs ?? nowMs,
  };
  const elapsed = nowMs - (state.stalledSinceMs ?? nowMs);
  const sinceAction = state.lastActionAtMs === null ? Infinity : nowMs - state.lastActionAtMs;
  if (elapsed < 12_000 || sinceAction < 15_000) {
    return { state, action: "none" };
  }
  if (state.restartAttempts < 2) {
    return {
      state: { ...state, lastActionAtMs: nowMs, restartAttempts: state.restartAttempts + 1 },
      action: "ice-restart",
    };
  }
  // A full rejoin is deliberately last resort: only after a sustained stall
  // and two spaced ICE restarts. Never rebuild without a fresh auth gate.
  if (elapsed >= 40_000 && canRebuild && sinceAction >= 15_000) {
    return {
      state: { ...state, lastActionAtMs: nowMs },
      action: "rebuild",
    };
  }
  return { state, action: "none" };
}
