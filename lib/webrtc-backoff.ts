/** Jitter ±20% around a delay (join ACK retry / ICE reconnect). */
export function jitterWebrtcDelay(ms: number): number {
  return Math.round(ms * (0.8 + Math.random() * 0.4));
}

/**
 * Exponential backoff for WebRTC reconnect / join ACK retry.
 * Caps attempt at 8 to avoid overflow; applies jitter.
 */
export function computeWebrtcReconnectDelay(
  attempt: number,
  baseMs: number,
  maxMs: number,
): number {
  const cappedAttempt = Math.max(0, Math.min(attempt, 8));
  return jitterWebrtcDelay(Math.min(maxMs, baseMs * 2 ** cappedAttempt));
}
