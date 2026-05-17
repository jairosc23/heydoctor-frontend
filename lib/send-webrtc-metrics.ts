import { fetchWithAuth } from './heydoctor-api';

export type WebrtcResilienceEventType =
  | 'reconnect_attempts'
  | 'reconnect_success'
  | 'ice_restart_count'
  | 'media_recovery_failures';

export type SendCallMetricsInput = {
  backendOrigin: string;
  consultationId: string;
  rtt?: number;
  packetsLost?: number;
  bitrate?: number;
  jitter?: number;
  packetLossRatio?: number;
  eventType?: WebrtcResilienceEventType;
  eventCount?: number;
};

/**
 * POST /api/webrtc/metrics — telemetry only (no media, no SDP).
 */
export async function sendCallMetrics(
  input: SendCallMetricsInput,
): Promise<void> {
  const {
    backendOrigin,
    consultationId,
    rtt,
    packetsLost,
    bitrate,
    jitter,
    packetLossRatio,
    eventType,
    eventCount,
  } = input;

  const url = new URL('/api/webrtc/metrics', backendOrigin.replace(/\/$/, '')).toString();

  const body: Record<string, unknown> = { consultationId };
  if (rtt !== undefined) body.rtt = rtt;
  if (packetsLost !== undefined) body.packetsLost = packetsLost;
  if (bitrate !== undefined) body.bitrate = bitrate;
  if (jitter !== undefined && !Number.isNaN(jitter)) body.jitter = jitter;
  if (packetLossRatio !== undefined) body.packetLossRatio = packetLossRatio;
  if (eventType) body.eventType = eventType;
  if (eventCount !== undefined) body.eventCount = eventCount;

  const res = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `webrtc metrics ${res.status}: ${text.slice(0, 160)}`,
    );
  }
}
