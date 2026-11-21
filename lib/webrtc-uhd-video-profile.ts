/**
 * RC18 UHD 4K camera mode. Opt-in dynamically on truly healthy connections.
 * Never assert UHD from requested constraints alone: verify getSettings().
 * Callers own the network gate and serialize transitions.
 */
export const UHD_WIDTH = 3840;
export const UHD_HEIGHT = 2160;
export const UHD_VIDEO_BITRATE_BPS = 10_000_000;
export const UHD_MIN_OUTGOING_BPS = 14_000_000;
export const UHD_STABLE_SAMPLES = 12;
export const UHD_BASELINE_WIDTH = 1280;
export const UHD_BASELINE_HEIGHT = 720;

export type UhdNetworkSample = {
  lossRatio: number;
  rttMs?: number;
  availableOutgoingBitrateBps?: number;
  packetsSentInInterval: number;
  cpuLimited: boolean;
};

export function uhdNetworkEligible(sample: UhdNetworkSample): boolean {
  return (
    sample.packetsSentInInterval > 0 &&
    sample.lossRatio < 0.005 &&
    sample.rttMs !== undefined &&
    sample.rttMs < 120 &&
    sample.availableOutgoingBitrateBps !== undefined &&
    sample.availableOutgoingBitrateBps >= UHD_MIN_OUTGOING_BPS &&
    !sample.cpuLimited
  );
}

export function uhdMustDowngrade(sample: UhdNetworkSample): boolean {
  return (
    sample.lossRatio >= 0.02 ||
    (sample.rttMs !== undefined && sample.rttMs >= 220) ||
    (sample.availableOutgoingBitrateBps !== undefined &&
      sample.availableOutgoingBitrateBps < 11_000_000) ||
    sample.cpuLimited
  );
}

export function isActualUhd(settings: Pick<MediaTrackSettings, "width" | "height">): boolean {
  return (settings.width ?? 0) >= UHD_WIDTH && (settings.height ?? 0) >= UHD_HEIGHT;
}

export function cameraCanOfferUhd(track: MediaStreamTrack): boolean {
  if (track.kind !== "video" || track.readyState !== "live" ||
      typeof track.getCapabilities !== "function") return false;
  try {
    const capabilities = track.getCapabilities();
    return (capabilities.width?.max ?? 0) >= UHD_WIDTH &&
      (capabilities.height?.max ?? 0) >= UHD_HEIGHT;
  } catch {
    return false;
  }
}

export async function restoreBaselineCapture(track: MediaStreamTrack): Promise<void> {
  if (track.readyState !== "live") return;
  await track.applyConstraints({
    width: { ideal: UHD_BASELINE_WIDTH, max: UHD_BASELINE_WIDTH },
    height: { ideal: UHD_BASELINE_HEIGHT, max: UHD_BASELINE_HEIGHT },
    frameRate: { ideal: 24, max: 30 },
  });
}

export async function requestVerifiedUhdCapture(track: MediaStreamTrack): Promise<boolean> {
  if (!cameraCanOfferUhd(track)) return false;
  try {
    await track.applyConstraints({
      width: { exact: UHD_WIDTH },
      height: { exact: UHD_HEIGHT },
      frameRate: { ideal: 24, max: 30 },
    });
    if (isActualUhd(track.getSettings())) return true;
  } catch {
    // Unsupported camera format, energy/driver constraints, or browser limits.
  }
  try {
    await restoreBaselineCapture(track);
  } catch {
    // Keep existing live video if device will not accept reconfiguration.
  }
  return false;
}
