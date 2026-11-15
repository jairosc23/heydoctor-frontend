export type ConnectionQuality =
  | 'good'
  | 'weak'
  | 'poor'
  | 'reconnecting'
  | 'failed';

export function deriveConnectionQuality(params: {
  reconnecting: boolean;
  iceConnectionState: RTCIceConnectionState | null;
  lossRatio: number;
  rttMs?: number;
  outboundBitrateBps?: number;
  videoSuspendedForNetwork: boolean;
}): ConnectionQuality {
  const {
    reconnecting,
    iceConnectionState,
    lossRatio,
    rttMs,
    outboundBitrateBps,
    videoSuspendedForNetwork,
  } = params;

  if (reconnecting) {
    return 'reconnecting';
  }

  if (iceConnectionState === 'failed') {
    return 'failed';
  }

  if (iceConnectionState === 'disconnected') {
    return 'reconnecting';
  }

  if (
    lossRatio > 0.1 ||
    (rttMs !== undefined && rttMs > 420) ||
    (!videoSuspendedForNetwork &&
      outboundBitrateBps !== undefined &&
      outboundBitrateBps > 0 &&
      outboundBitrateBps < 95_000)
  ) {
    return 'poor';
  }

  if (
    lossRatio > 0.035 ||
    (rttMs !== undefined && rttMs > 260)
  ) {
    return 'weak';
  }

  return 'good';
}


/**
 * Presentation-only quality stabilizer. Does not modify transport, bitrate, ICE,
 * or media tracks. Critical loss of connectivity is signalled immediately.
 * Two consecutive 2.5s samples avoid an unstable badge during route handover.
 */
export type QualityState = Readonly<{
  visible: ConnectionQuality;
  candidate: ConnectionQuality | null;
  samples: number;
}>;

export const INITIAL_QUALITY_STATE: QualityState = {
  visible: "good",
  candidate: null,
  samples: 0,
};

export function advanceQualityState(
  previous: QualityState,
  observed: ConnectionQuality,
): QualityState {
  // Never hide an actual disconnection or explicit reconnect attempt.
  if (observed === "failed" || observed === "reconnecting") {
    return { visible: observed, candidate: null, samples: 0 };
  }

  // Do not mask a severe, sustained network impairment behind "Conectado".
  if (observed === "poor" && previous.visible === "good") {
    return { visible: "poor", candidate: null, samples: 0 };
  }

  if (previous.visible === observed) {
    return { visible: observed, candidate: null, samples: 0 };
  }

  const samples = previous.candidate === observed ? previous.samples + 1 : 1;
  // Quality recovers only after independent, consistent samples; a transient
  // low-rate adaptation must not trigger false connected/weak oscillations.
  if (samples >= 2) {
    return { visible: observed, candidate: null, samples: 0 };
  }

  return { ...previous, candidate: observed, samples };
}
