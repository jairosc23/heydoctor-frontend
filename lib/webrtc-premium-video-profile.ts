/**
 * RC18 premium video profile: conservative 720p bitrate headroom.
 * Start with the certified 1.4 Mbps envelope; unlock 2 Mbps only after
 * sustained, measured network headroom. No extra capture/CPU requirements.
 */
export const BASELINE_VIDEO_BITRATE_BPS = 1_400_000;
export const PREMIUM_VIDEO_BITRATE_BPS = 2_000_000;
export const PREMIUM_MIN_HEADROOM_BPS = 2_600_000;
export const PREMIUM_REQUIRED_STABLE_SAMPLES = 8;

export type PremiumNetworkSample = {
  intervalLossRatio: number;
  rttMs?: number;
  availableOutgoingBitrateBps?: number;
  packetsSentInInterval: number;
};

export function intervalVideoLossRatio(
  prev: { lost: number; sent: number } | null,
  current: { lost: number; sent: number },
): number {
  if (!prev) return 0;
  const sent = Math.max(0, current.sent - prev.sent);
  const lost = Math.max(0, current.lost - prev.lost);
  if (sent + lost === 0) return 0;
  return lost / (sent + lost);
}

export function hasPremiumVideoHeadroom(sample: PremiumNetworkSample): boolean {
  return (
    sample.packetsSentInInterval > 0 &&
    sample.intervalLossRatio < 0.01 &&
    sample.rttMs !== undefined &&
    sample.rttMs < 150 &&
    sample.availableOutgoingBitrateBps !== undefined &&
    sample.availableOutgoingBitrateBps >= PREMIUM_MIN_HEADROOM_BPS
  );
}

export function shouldExitPremiumVideo(sample: PremiumNetworkSample): boolean {
  return (
    sample.intervalLossRatio >= 0.03 ||
    (sample.rttMs !== undefined && sample.rttMs >= 250) ||
    (sample.availableOutgoingBitrateBps !== undefined &&
      sample.availableOutgoingBitrateBps < 2_200_000)
  );
}
