/**
 * HeyDoctor M4 — one clinical-call recovery decision contract.
 * Pure policy: no signaling secrets, room IDs, PHI or network side effects.
 * Control plane is authoritative: media must never negotiate before an
 * authenticated consultation join was acknowledged by the server.
 */
export type RecoveryAction = "wait" | "ice-restart" | "rebuild";

export interface RecoverySnapshot {
  nowMs: number;
  socketConnected: boolean;
  roomJoined: boolean;
  remotePeerPresent: boolean;
  iceState: RTCIceConnectionState | null;
  connectionState: RTCPeerConnectionState | null;
  degradedSinceMs: number | null;
  iceRestarts: number;
  lastIceRestartMs: number | null;
  rebuilds: number;
  lastRebuildMs: number | null;
  isInitiator: boolean;
  pageVisible: boolean;
}

export const RECOVERY_POLICY = Object.freeze({
  iceRestartAfterMs: 8_000,
  fullRebuildAfterMs: 30_000,
  minIceRestartSpacingMs: 4_500,
  minRebuildSpacingMs: 60_000,
  maxRebuildsPerSession: 2,
  iceAttemptsBeforeRebuild: 2,
});

export function decideCallRecovery(
  s: RecoverySnapshot,
  policy = RECOVERY_POLICY,
): RecoveryAction {
  // The server authorization gate always outranks local media state.
  if (!s.isInitiator || !s.pageVisible || !s.socketConnected ||
      !s.roomJoined || !s.remotePeerPresent) return "wait";
  if (!Number.isFinite(s.nowMs) || s.degradedSinceMs == null ||
      !Number.isFinite(s.degradedSinceMs) ||
      s.degradedSinceMs > s.nowMs) return "wait";
  const degraded = s.iceState === "failed" || s.iceState === "disconnected" ||
    s.connectionState === "failed" || s.connectionState === "disconnected";
  if (!degraded) return "wait";
  const ageMs = s.nowMs - s.degradedSinceMs;
  if (ageMs >= policy.fullRebuildAfterMs &&
      s.iceRestarts >= policy.iceAttemptsBeforeRebuild &&
      s.rebuilds < policy.maxRebuildsPerSession &&
      (s.lastRebuildMs == null ||
        s.nowMs - s.lastRebuildMs >= policy.minRebuildSpacingMs)) {
    return "rebuild";
  }
  if (ageMs >= policy.iceRestartAfterMs &&
      (s.lastIceRestartMs == null ||
        s.nowMs - s.lastIceRestartMs >= policy.minIceRestartSpacingMs)) {
    return "ice-restart";
  }
  return "wait";
}
