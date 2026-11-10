/**
 * Monotonic RTP packet counters. The loss ratio must compare the SAME
 * interval of packets sent and lost, never delta loss / lifetime sent.
 * No clinical identifiers or telemetry leave this pure module.
 */
export type PacketCounters = Readonly<{ sent: number; lost: number }>;
export type PacketLossDelta = Readonly<{
  lossRatio: number;
  sentDelta: number;
  lostDelta: number;
  reset: boolean;
}>;

export function calculatePacketLossDelta(
  previous: PacketCounters | null,
  current: PacketCounters,
): PacketLossDelta {
  const valid = (n: number) => Number.isFinite(n) && n >= 0;
  if (!valid(current.sent) || !valid(current.lost)) {
    return { lossRatio: 0, sentDelta: 0, lostDelta: 0, reset: true };
  }
  if (!previous || !valid(previous.sent) || !valid(previous.lost) ||
      current.sent < previous.sent || current.lost < previous.lost) {
    return { lossRatio: 0, sentDelta: 0, lostDelta: 0, reset: true };
  }
  const sentDelta = current.sent - previous.sent;
  const lostDelta = current.lost - previous.lost;
  const total = sentDelta + lostDelta;
  return {
    sentDelta,
    lostDelta,
    lossRatio: total > 0 ? Math.min(1, Math.max(0, lostDelta / total)) : 0,
    reset: false,
  };
}
