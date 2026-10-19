/**
 * W2 — Gates for reconnect metrics / ICE restart storms (PHI-safe, pure).
 */

export function shouldReportReconnectSuccess(input: {
  wasReconnecting: boolean;
  reconnectAttempts: number;
}): boolean {
  return input.wasReconnecting || input.reconnectAttempts > 0;
}

export function canScheduleIceRestart(input: {
  iceRestartCount: number;
  maxIceRestarts: number;
  lastIceRestartAtMs: number | null;
  nowMs: number;
  minIntervalMs: number;
}): boolean {
  if (input.iceRestartCount >= input.maxIceRestarts) return false;
  if (
    input.lastIceRestartAtMs != null &&
    input.nowMs - input.lastIceRestartAtMs < input.minIntervalMs
  ) {
    return false;
  }
  return true;
}

export const DEFAULT_MAX_ICE_RESTARTS = 10;
export const DEFAULT_MIN_ICE_RESTART_INTERVAL_MS = 4_500;
